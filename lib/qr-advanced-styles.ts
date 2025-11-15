// Advanced visual customization for QR codes

export type ModuleShape = 'square' | 'dots' | 'rounded' | 'extra-rounded' | 'classy';

export interface EyeColors {
  topLeft: string;
  topRight: string;
  bottomLeft: string;
}

export interface PresetSize {
  name: string;
  category: 'social' | 'print' | 'web';
  width: number;
  height: number;
  description: string;
}

export const MODULE_SHAPES: { value: ModuleShape; label: string; description: string }[] = [
  { value: 'square', label: 'Square', description: 'Classic square modules' },
  { value: 'dots', label: 'Dots', description: 'Circular dots for a modern look' },
  { value: 'rounded', label: 'Rounded', description: 'Rounded corners for smooth appearance' },
  { value: 'extra-rounded', label: 'Extra Rounded', description: 'Very round modules' },
  { value: 'classy', label: 'Classy', description: 'Vertical rounded rectangles' },
];

export const PRESET_SIZES: PresetSize[] = [
  // Social Media
  { name: 'Instagram Post', category: 'social', width: 1080, height: 1080, description: 'Square format for Instagram' },
  { name: 'Instagram Story', category: 'social', width: 1080, height: 1920, description: 'Vertical format for Stories' },
  { name: 'Facebook Post', category: 'social', width: 1200, height: 1200, description: 'Optimized for Facebook' },
  { name: 'Twitter Post', category: 'social', width: 1200, height: 675, description: 'Wide format for Twitter/X' },
  { name: 'LinkedIn Post', category: 'social', width: 1200, height: 1200, description: 'Professional square format' },

  // Print
  { name: 'Business Card', category: 'print', width: 1050, height: 1050, description: '3.5" x 3.5" at 300 DPI' },
  { name: 'Flyer Small', category: 'print', width: 1500, height: 1500, description: '5" x 5" at 300 DPI' },
  { name: 'Flyer Large', category: 'print', width: 2400, height: 2400, description: '8" x 8" at 300 DPI' },
  { name: 'Poster', category: 'print', width: 3600, height: 3600, description: '12" x 12" at 300 DPI' },
  { name: 'Banner', category: 'print', width: 3000, height: 1000, description: 'Wide banner format' },

  // Web
  { name: 'Website Small', category: 'web', width: 256, height: 256, description: 'Small web icon' },
  { name: 'Website Medium', category: 'web', width: 512, height: 512, description: 'Medium web icon' },
  { name: 'Website Large', category: 'web', width: 1024, height: 1024, description: 'Large web display' },
  { name: 'Email Signature', category: 'web', width: 300, height: 300, description: 'Compact for emails' },
  { name: 'App Icon', category: 'web', width: 1024, height: 1024, description: 'High-res app icon' },
];

/**
 * Draw a module with custom shape
 */
export function drawModule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  shape: ModuleShape
): void {
  switch (shape) {
    case 'dots':
      ctx.beginPath();
      ctx.arc(x + size / 2, y + size / 2, size / 2.5, 0, 2 * Math.PI);
      ctx.fill();
      break;

    case 'rounded':
      const radius = size / 4;
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, radius);
      ctx.fill();
      break;

    case 'extra-rounded':
      const bigRadius = size / 2;
      ctx.beginPath();
      ctx.roundRect(x, y, size, size, bigRadius);
      ctx.fill();
      break;

    case 'classy':
      // Vertical rounded rectangles
      const classyRadius = size / 3;
      ctx.beginPath();
      ctx.roundRect(x, y, size, size * 1.2, classyRadius);
      ctx.fill();
      break;

    case 'square':
    default:
      ctx.fillRect(x, y, size, size);
      break;
  }
}

/**
 * Draw a finder pattern (eye) with custom color
 */
export function drawFinderPatternWithColor(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  moduleSize: number,
  patternStyle: string,
  color: string,
  backgroundColor: string,
  transparentBg: boolean
): void {
  const px = x * moduleSize;
  const py = y * moduleSize;
  const patternSize = 7 * moduleSize;

  if (patternStyle === 'rounded') {
    // Outer square (rounded)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(px, py, patternSize, patternSize, moduleSize);
    ctx.fill();

    // Middle square (rounded, background)
    ctx.fillStyle = transparentBg ? 'rgba(255,255,255,0)' : backgroundColor;
    ctx.beginPath();
    ctx.roundRect(
      px + moduleSize,
      py + moduleSize,
      patternSize - 2 * moduleSize,
      patternSize - 2 * moduleSize,
      moduleSize / 2
    );
    ctx.fill();

    // Inner square (rounded, foreground)
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(px + 2 * moduleSize, py + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize, moduleSize / 2);
    ctx.fill();
  } else if (patternStyle === 'dots') {
    // Outer ring of dots
    ctx.fillStyle = color;
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6) {
          ctx.beginPath();
          ctx.arc(
            px + i * moduleSize + moduleSize / 2,
            py + j * moduleSize + moduleSize / 2,
            moduleSize / 2.5,
            0,
            2 * Math.PI
          );
          ctx.fill();
        }
      }
    }
    // Inner center
    ctx.beginPath();
    ctx.arc(px + 3.5 * moduleSize, py + 3.5 * moduleSize, 1.5 * moduleSize, 0, 2 * Math.PI);
    ctx.fill();
  } else if (patternStyle === 'extra-rounded') {
    // Very round finder patterns
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(px, py, patternSize, patternSize, moduleSize * 1.5);
    ctx.fill();

    ctx.fillStyle = transparentBg ? 'rgba(255,255,255,0)' : backgroundColor;
    ctx.beginPath();
    ctx.roundRect(
      px + moduleSize,
      py + moduleSize,
      patternSize - 2 * moduleSize,
      patternSize - 2 * moduleSize,
      moduleSize
    );
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(px + 3.5 * moduleSize, py + 3.5 * moduleSize, 1.5 * moduleSize, 0, 2 * Math.PI);
    ctx.fill();
  } else {
    // Standard square finder pattern
    ctx.fillStyle = color;
    ctx.fillRect(px, py, patternSize, patternSize);
    ctx.fillStyle = transparentBg ? 'rgba(255,255,255,0)' : backgroundColor;
    ctx.fillRect(px + moduleSize, py + moduleSize, patternSize - 2 * moduleSize, patternSize - 2 * moduleSize);
    ctx.fillStyle = color;
    ctx.fillRect(px + 2 * moduleSize, py + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
  }
}

/**
 * Blend QR code with background image
 */
export async function blendWithBackgroundImage(
  qrDataUrl: string,
  backgroundImageUrl: string,
  size: number,
  opacity: number = 0.3
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = size;
  canvas.height = size;

  // Load background image
  const bgImage = new Image();
  bgImage.crossOrigin = 'anonymous';
  await new Promise((resolve, reject) => {
    bgImage.onload = resolve;
    bgImage.onerror = reject;
    bgImage.src = backgroundImageUrl;
  });

  // Draw background image (cover fit)
  const scale = Math.max(size / bgImage.width, size / bgImage.height);
  const scaledWidth = bgImage.width * scale;
  const scaledHeight = bgImage.height * scale;
  const offsetX = (size - scaledWidth) / 2;
  const offsetY = (size - scaledHeight) / 2;

  ctx.drawImage(bgImage, offsetX, offsetY, scaledWidth, scaledHeight);

  // Apply opacity to background
  ctx.globalAlpha = opacity;

  // Load QR code
  const qrImage = new Image();
  await new Promise((resolve, reject) => {
    qrImage.onload = resolve;
    qrImage.onerror = reject;
    qrImage.src = qrDataUrl;
  });

  // Draw QR code on top
  ctx.globalAlpha = 1;
  ctx.drawImage(qrImage, 0, 0, size, size);

  return canvas.toDataURL();
}

/**
 * Export QR code at specific preset size
 */
export async function exportAtPresetSize(
  qrDataUrl: string,
  preset: PresetSize
): Promise<string> {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = preset.width;
  canvas.height = preset.height;

  // Load QR code
  const qrImage = new Image();
  await new Promise((resolve, reject) => {
    qrImage.onload = resolve;
    qrImage.onerror = reject;
    qrImage.src = qrDataUrl;
  });

  // Center QR code if dimensions differ
  if (preset.width === preset.height) {
    ctx.drawImage(qrImage, 0, 0, preset.width, preset.height);
  } else {
    // For non-square presets, center the QR code
    const qrSize = Math.min(preset.width, preset.height);
    const offsetX = (preset.width - qrSize) / 2;
    const offsetY = (preset.height - qrSize) / 2;

    // Fill background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, preset.width, preset.height);

    ctx.drawImage(qrImage, offsetX, offsetY, qrSize, qrSize);
  }

  return canvas.toDataURL();
}
