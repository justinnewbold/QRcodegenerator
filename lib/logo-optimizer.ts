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

// ============================================
// Logo Readability Verification System
// ============================================

export interface ReadabilityScore {
  score: number; // 1-10
  label: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  factors: {
    logoSize: number; // 1-10
    contrastRatio: number; // 1-10
    complexity: number; // 1-10
    errorCorrectionMargin: number; // 1-10
  };
  estimatedRecovery: number; // Percentage of QR modules that can be recovered
  recommendations: string[];
  suggestedSettings: {
    logoSize: number;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    qrSize: number;
  };
}

/**
 * Calculate contrast ratio between two colors
 */
function calculateContrastRatio(color1: string, color2: string): number {
  const getLuminance = (hex: string): number => {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;

    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate readability score for a logo on a QR code
 */
export function calculateReadabilityScore(
  analysis: LogoAnalysis,
  logoSizePercent: number,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H',
  qrForegroundColor: string = '#000000',
  qrBackgroundColor: string = '#FFFFFF'
): ReadabilityScore {
  const recommendations: string[] = [];

  // Error correction capacity percentages
  const ecCapacity: Record<string, number> = {
    'L': 7,
    'M': 15,
    'Q': 25,
    'H': 30,
  };

  // Calculate logo size score (smaller = better for scannability)
  let logoSizeScore: number;
  if (logoSizePercent <= 15) {
    logoSizeScore = 10;
  } else if (logoSizePercent <= 20) {
    logoSizeScore = 8;
  } else if (logoSizePercent <= 25) {
    logoSizeScore = 6;
  } else if (logoSizePercent <= 30) {
    logoSizeScore = 4;
  } else {
    logoSizeScore = 2;
  }

  // Calculate contrast score
  const dominantLogoColor = analysis.dominantColors[0] || '#808080';
  const fgContrast = calculateContrastRatio(dominantLogoColor, qrForegroundColor);
  const bgContrast = calculateContrastRatio(dominantLogoColor, qrBackgroundColor);
  const avgContrast = (fgContrast + bgContrast) / 2;

  let contrastScore: number;
  if (avgContrast >= 4.5) {
    contrastScore = 10;
  } else if (avgContrast >= 3) {
    contrastScore = 7;
  } else if (avgContrast >= 2) {
    contrastScore = 4;
  } else {
    contrastScore = 2;
  }

  // Calculate complexity score (simpler = better)
  let complexityScore: number;
  switch (analysis.complexity) {
    case 'simple':
      complexityScore = 10;
      break;
    case 'moderate':
      complexityScore = 7;
      break;
    case 'complex':
      complexityScore = 4;
      break;
    default:
      complexityScore = 5;
  }

  // Calculate error correction margin
  // Logo covers approximately (logoSizePercent)^2 of the QR area
  const logoCoverage = logoSizePercent * logoSizePercent / 100;
  const availableRecovery = ecCapacity[errorCorrectionLevel];
  const marginPercent = availableRecovery - logoCoverage;

  let ecMarginScore: number;
  if (marginPercent >= 15) {
    ecMarginScore = 10;
  } else if (marginPercent >= 10) {
    ecMarginScore = 8;
  } else if (marginPercent >= 5) {
    ecMarginScore = 5;
  } else if (marginPercent >= 0) {
    ecMarginScore = 3;
  } else {
    ecMarginScore = 1;
  }

  // Estimate recovery percentage
  const estimatedRecovery = Math.max(0, Math.min(100, 100 - logoCoverage + marginPercent));

  // Calculate overall score (weighted average)
  const overallScore = Math.round(
    (logoSizeScore * 0.35 +
      contrastScore * 0.2 +
      complexityScore * 0.2 +
      ecMarginScore * 0.25) * 10
  ) / 10;

  // Determine label
  let label: ReadabilityScore['label'];
  if (overallScore >= 8) {
    label = 'Excellent';
  } else if (overallScore >= 6) {
    label = 'Good';
  } else if (overallScore >= 4) {
    label = 'Fair';
  } else if (overallScore >= 2) {
    label = 'Poor';
  } else {
    label = 'Critical';
  }

  // Generate recommendations
  if (logoSizeScore < 6) {
    const suggestedSize = analysis.complexity === 'complex' ? 15 : 20;
    recommendations.push(`Reduce logo size to ${suggestedSize}% for better scannability.`);
  }

  if (contrastScore < 6) {
    recommendations.push('Improve contrast between logo and QR code colors.');
  }

  if (ecMarginScore < 5 && errorCorrectionLevel !== 'H') {
    recommendations.push(`Increase error correction to H (30%) for safety margin.`);
  }

  if (analysis.complexity === 'complex' && logoSizePercent > 15) {
    recommendations.push('Complex logo detected. Use maximum 15% size or simplify design.');
  }

  if (marginPercent < 5) {
    recommendations.push('⚠ Low recovery margin. QR may not scan reliably with damage.');
  }

  if (recommendations.length === 0) {
    recommendations.push('✓ Current settings provide good scannability.');
  }

  // Suggest optimal settings
  let suggestedLogoSize = logoSizePercent;
  let suggestedEC: 'L' | 'M' | 'Q' | 'H' = errorCorrectionLevel;
  let suggestedQRSize = 300;

  if (overallScore < 6) {
    suggestedLogoSize = analysis.complexity === 'complex' ? 15 : 20;
    suggestedEC = 'H';
    suggestedQRSize = analysis.complexity === 'complex' ? 500 : 400;
  } else if (overallScore < 8) {
    suggestedEC = errorCorrectionLevel === 'L' ? 'M' : errorCorrectionLevel;
  }

  return {
    score: overallScore,
    label,
    factors: {
      logoSize: logoSizeScore,
      contrastRatio: contrastScore,
      complexity: complexityScore,
      errorCorrectionMargin: ecMarginScore,
    },
    estimatedRecovery: Math.round(estimatedRecovery),
    recommendations,
    suggestedSettings: {
      logoSize: suggestedLogoSize,
      errorCorrectionLevel: suggestedEC,
      qrSize: suggestedQRSize,
    },
  };
}

/**
 * Get a human-readable readability summary
 */
export function getReadabilitySummary(score: ReadabilityScore): string {
  const scoreText = `${score.score}/10 (${score.label})`;
  const recoveryText = `~${score.estimatedRecovery}% recoverable`;

  return `Scannability: ${scoreText} | ${recoveryText}`;
}

/**
 * Quick check if logo settings are likely to produce a scannable QR
 */
export function isLogoSettingSafe(
  logoSizePercent: number,
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H',
  complexity: LogoAnalysis['complexity'] = 'moderate'
): boolean {
  const ecCapacity: Record<string, number> = {
    'L': 7,
    'M': 15,
    'Q': 25,
    'H': 30,
  };

  // Adjust tolerance based on complexity
  const complexityPenalty = complexity === 'complex' ? 5 : complexity === 'moderate' ? 2 : 0;
  const logoCoverage = (logoSizePercent * logoSizePercent) / 100;
  const margin = ecCapacity[errorCorrectionLevel] - logoCoverage - complexityPenalty;

  return margin >= 5; // At least 5% safety margin
}
