export interface LogoAnalysis {
  width: number;
  height: number;
  aspectRatio: number;
  fileSize: number;
  hasTransparency: boolean;
  dominantColors: string[];
  complexity: 'simple' | 'moderate' | 'complex';
  recommendations: string[];
  optimalSize: number;
  positioning: {
    centered: boolean;
    offset?: { x: number; y: number };
  };
}

/**
 * Analyze a logo image and provide optimization recommendations
 */
export async function analyzeLogo(imageDataUrl: string): Promise<LogoAnalysis> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;

      // Check transparency
      let hasTransparency = false;
      let opaquePixels = 0;
      const colorMap = new Map<string, number>();

      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha < 255) {
          hasTransparency = true;
        }
        if (alpha > 128) {
          opaquePixels++;
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const colorKey = `${Math.floor(r / 32)},${Math.floor(g / 32)},${Math.floor(b / 32)}`;
          colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
        }
      }

      // Get dominant colors
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([key]) => {
          const [r, g, b] = key.split(',').map(v => parseInt(v) * 32);
          return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        });

      // Determine complexity
      const uniqueColors = colorMap.size;
      let complexity: 'simple' | 'moderate' | 'complex';
      if (uniqueColors < 10) {
        complexity = 'simple';
      } else if (uniqueColors < 50) {
        complexity = 'moderate';
      } else {
        complexity = 'complex';
      }

      // Calculate aspect ratio
      const aspectRatio = img.width / img.height;

      // Generate recommendations
      const recommendations: string[] = [];

      // Size recommendations
      const pixelCount = img.width * img.height;
      if (pixelCount > 250000) {
        recommendations.push('Image is very large. Consider reducing to 300×300 pixels for optimal QR code scanning.');
      } else if (pixelCount < 10000) {
        recommendations.push('Image resolution is low. Use at least 200×200 pixels for best quality.');
      }

      // Aspect ratio recommendations
      if (Math.abs(aspectRatio - 1) > 0.2) {
        recommendations.push('Logo is not square. Consider cropping to 1:1 aspect ratio for centered placement.');
      }

      // Transparency recommendations
      if (!hasTransparency) {
        recommendations.push('Add transparent background for seamless integration with QR code.');
      }

      // Complexity recommendations
      if (complexity === 'complex') {
        recommendations.push('Logo has high detail. Simplify design or increase QR code error correction to High (30%).');
        recommendations.push('Consider using a larger QR code size (500px+) to accommodate complex logo.');
      }

      // Color recommendations
      if (sortedColors.length > 0) {
        const isDark = sortedColors.some(color => {
          const hex = color.replace('#', '');
          const r = parseInt(hex.substr(0, 2), 16);
          const g = parseInt(hex.substr(2, 2), 16);
          const b = parseInt(hex.substr(4, 2), 16);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          return luminance < 0.5;
        });

        if (isDark) {
          recommendations.push('Logo has dark colors. Use light QR code background for contrast.');
        } else {
          recommendations.push('Logo has light colors. Use dark QR code background for contrast.');
        }
      }

      // File size estimation
      const base64Length = imageDataUrl.split(',')[1].length;
      const fileSize = (base64Length * 3) / 4;

      if (fileSize > 500000) {
        recommendations.push('File size is large (>500KB). Compress image to reduce load time.');
      }

      // Optimal size calculation
      let optimalSize = 0.2; // 20% default
      if (complexity === 'simple') {
        optimalSize = 0.25; // Can be larger with simple logos
      } else if (complexity === 'complex') {
        optimalSize = 0.15; // Should be smaller with complex logos
      }

      if (pixelCount < 40000) {
        optimalSize = Math.min(optimalSize, 0.15); // Small images should be smaller
      }

      const analysis: LogoAnalysis = {
        width: img.width,
        height: img.height,
        aspectRatio,
        fileSize,
        hasTransparency,
        dominantColors: sortedColors,
        complexity,
        recommendations,
        optimalSize,
        positioning: {
          centered: Math.abs(aspectRatio - 1) < 0.1,
          offset: Math.abs(aspectRatio - 1) > 0.1 ? { x: 0, y: 0 } : undefined,
        },
      };

      resolve(analysis);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
}

/**
 * Optimize logo for QR code use
 */
export async function optimizeLogo(
  imageDataUrl: string,
  targetSize: number = 300,
  addPadding: boolean = true
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate dimensions with padding
      const padding = addPadding ? 20 : 0;
      const actualSize = targetSize - (padding * 2);

      canvas.width = targetSize;
      canvas.height = targetSize;

      // Clear with transparency
      ctx.clearRect(0, 0, targetSize, targetSize);

      // Draw image centered with padding
      const scale = Math.min(actualSize / img.width, actualSize / img.height);
      const scaledWidth = img.width * scale;
      const scaledHeight = img.height * scale;
      const x = (targetSize - scaledWidth) / 2;
      const y = (targetSize - scaledHeight) / 2;

      ctx.drawImage(img, x, y, scaledWidth, scaledHeight);

      resolve(canvas.toDataURL('image/png'));
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = imageDataUrl;
  });
}

/**
 * Get positioning recommendations based on logo analysis
 */
export function getPositioningRecommendations(analysis: LogoAnalysis): string[] {
  const recommendations: string[] = [];

  if (analysis.positioning.centered) {
    recommendations.push('✓ Logo is square - perfect for center positioning');
  } else {
    if (analysis.aspectRatio > 1.3) {
      recommendations.push('Logo is wide - consider left/right alignment or crop to square');
    } else if (analysis.aspectRatio < 0.7) {
      recommendations.push('Logo is tall - consider top/bottom alignment or crop to square');
    }
  }

  if (analysis.hasTransparency) {
    recommendations.push('✓ Logo has transparency - will blend seamlessly with QR code');
  }

  if (analysis.complexity === 'simple') {
    recommendations.push('✓ Simple logo design - can use larger size (up to 30% of QR code)');
  } else if (analysis.complexity === 'complex') {
    recommendations.push('⚠ Complex logo - use smaller size (15-20%) and high error correction');
  }

  return recommendations;
}
