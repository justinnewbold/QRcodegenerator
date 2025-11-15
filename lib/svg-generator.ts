// Advanced SVG generation for QR codes with full custom styling support

import QRCode from 'qrcode';
import type { ErrorCorrectionLevel, QRStyle, FinderPattern, GradientConfig, EyeColors } from './qr-generator';

interface SVGQROptions {
  content: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
  style?: QRStyle;
  gradient?: GradientConfig;
  finderPattern?: FinderPattern;
  eyeColors?: EyeColors;
  transparentBackground?: boolean;
}

/**
 * Generate a fully styled SVG QR code with custom shapes, gradients, and eye colors
 */
export async function generateStyledSVG(options: SVGQROptions): Promise<string> {
  const {
    content,
    errorCorrectionLevel,
    size,
    foregroundColor,
    backgroundColor,
    margin,
    style = 'squares',
    gradient,
    finderPattern = 'square',
    eyeColors,
    transparentBackground = false,
  } = options;

  // Generate base QR code data
  const qrData = await QRCode.create(content, {
    errorCorrectionLevel,
  });

  const modules = qrData.modules;
  const moduleCount = modules.size;
  const moduleSize = size / (moduleCount + margin * 2);
  const offset = margin * moduleSize;

  // Helper to check if position is a finder pattern
  const isFinderPattern = (x: number, y: number) => {
    const finderSize = 7;
    return (
      (x < finderSize && y < finderSize) || // Top-left
      (x >= moduleCount - finderSize && y < finderSize) || // Top-right
      (x < finderSize && y >= moduleCount - finderSize) // Bottom-left
    );
  };

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n`;

  // Add definitions for gradients and patterns
  svg += '  <defs>\n';

  // Add gradient if enabled
  if (gradient?.enabled) {
    if (gradient.type === 'linear') {
      const angle = (gradient.rotation || 0) * Math.PI / 180;
      const x1 = 50 - Math.cos(angle) * 50;
      const y1 = 50 - Math.sin(angle) * 50;
      const x2 = 50 + Math.cos(angle) * 50;
      const y2 = 50 + Math.sin(angle) * 50;

      svg += `    <linearGradient id="qr-gradient" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">\n`;
      svg += `      <stop offset="0%" stop-color="${gradient.colorStart}" />\n`;
      svg += `      <stop offset="100%" stop-color="${gradient.colorEnd}" />\n`;
      svg += `    </linearGradient>\n`;
    } else {
      svg += `    <radialGradient id="qr-gradient" cx="50%" cy="50%" r="50%">\n`;
      svg += `      <stop offset="0%" stop-color="${gradient.colorStart}" />\n`;
      svg += `      <stop offset="100%" stop-color="${gradient.colorEnd}" />\n`;
      svg += `    </radialGradient>\n`;
    }
  }

  svg += '  </defs>\n';

  // Background
  if (!transparentBackground) {
    svg += `  <rect width="${size}" height="${size}" fill="${backgroundColor}" />\n`;
  }

  // Determine fill color
  const fillColor = gradient?.enabled ? 'url(#qr-gradient)' : foregroundColor;

  // Draw modules with custom style
  svg += '  <!-- Data modules -->\n';
  for (let y = 0; y < moduleCount; y++) {
    for (let x = 0; x < moduleCount; x++) {
      if (modules.get(x, y) && !isFinderPattern(x, y)) {
        const px = offset + x * moduleSize;
        const py = offset + y * moduleSize;

        svg += drawModuleSVG(px, py, moduleSize, style, fillColor);
      }
    }
  }

  // Draw finder patterns with custom colors and styles
  svg += '  <!-- Finder patterns -->\n';
  const topLeftColor = eyeColors?.topLeft || fillColor;
  const topRightColor = eyeColors?.topRight || fillColor;
  const bottomLeftColor = eyeColors?.bottomLeft || fillColor;

  svg += drawFinderPatternSVG(offset, offset, moduleSize, finderPattern, topLeftColor, backgroundColor, transparentBackground);
  svg += drawFinderPatternSVG(offset + (moduleCount - 7) * moduleSize, offset, moduleSize, finderPattern, topRightColor, backgroundColor, transparentBackground);
  svg += drawFinderPatternSVG(offset, offset + (moduleCount - 7) * moduleSize, moduleSize, finderPattern, bottomLeftColor, backgroundColor, transparentBackground);

  svg += '</svg>';
  return svg;
}

/**
 * Draw a single module with custom style
 */
function drawModuleSVG(x: number, y: number, size: number, style: QRStyle, fill: string): string {
  switch (style) {
    case 'dots':
      const radius = size / 2.5;
      const cx = x + size / 2;
      const cy = y + size / 2;
      return `  <circle cx="${cx}" cy="${cy}" r="${radius}" fill="${fill}" />\n`;

    case 'rounded':
      const r1 = size / 4;
      return `  <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r1}" fill="${fill}" />\n`;

    case 'extra-rounded':
      const r2 = size / 2;
      return `  <rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${r2}" fill="${fill}" />\n`;

    case 'classy':
      const r3 = size / 3;
      const height = size * 1.1;
      return `  <rect x="${x}" y="${y}" width="${size}" height="${height}" rx="${r3}" fill="${fill}" />\n`;

    case 'squares':
    default:
      return `  <rect x="${x}" y="${y}" width="${size}" height="${size}" fill="${fill}" />\n`;
  }
}

/**
 * Draw a finder pattern with custom style and color
 */
function drawFinderPatternSVG(
  x: number,
  y: number,
  moduleSize: number,
  pattern: FinderPattern,
  color: string,
  bgColor: string,
  transparentBg: boolean
): string {
  const patternSize = 7 * moduleSize;
  let svg = '';

  if (pattern === 'rounded') {
    // Outer square
    svg += `  <rect x="${x}" y="${y}" width="${patternSize}" height="${patternSize}" rx="${moduleSize}" fill="${color}" />\n`;
    // Middle square (background)
    const bgFill = transparentBg ? 'none' : bgColor;
    svg += `  <rect x="${x + moduleSize}" y="${y + moduleSize}" width="${patternSize - 2 * moduleSize}" height="${patternSize - 2 * moduleSize}" rx="${moduleSize / 2}" fill="${bgFill}" />\n`;
    // Inner square
    svg += `  <rect x="${x + 2 * moduleSize}" y="${y + 2 * moduleSize}" width="${3 * moduleSize}" height="${3 * moduleSize}" rx="${moduleSize / 2}" fill="${color}" />\n`;
  } else if (pattern === 'dots') {
    // Outer ring of dots
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (i === 0 || i === 6 || j === 0 || j === 6) {
          const cx = x + i * moduleSize + moduleSize / 2;
          const cy = y + j * moduleSize + moduleSize / 2;
          const r = moduleSize / 2.5;
          svg += `  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" />\n`;
        }
      }
    }
    // Inner center circle
    const centerX = x + 3.5 * moduleSize;
    const centerY = y + 3.5 * moduleSize;
    const centerR = 1.5 * moduleSize;
    svg += `  <circle cx="${centerX}" cy="${centerY}" r="${centerR}" fill="${color}" />\n`;
  } else if (pattern === 'extra-rounded') {
    // Very round finder patterns
    svg += `  <rect x="${x}" y="${y}" width="${patternSize}" height="${patternSize}" rx="${moduleSize * 1.5}" fill="${color}" />\n`;
    const bgFill = transparentBg ? 'none' : bgColor;
    svg += `  <rect x="${x + moduleSize}" y="${y + moduleSize}" width="${patternSize - 2 * moduleSize}" height="${patternSize - 2 * moduleSize}" rx="${moduleSize}" fill="${bgFill}" />\n`;
    const centerX = x + 3.5 * moduleSize;
    const centerY = y + 3.5 * moduleSize;
    const centerR = 1.5 * moduleSize;
    svg += `  <circle cx="${centerX}" cy="${centerY}" r="${centerR}" fill="${color}" />\n`;
  } else {
    // Standard square finder pattern
    svg += `  <rect x="${x}" y="${y}" width="${patternSize}" height="${patternSize}" fill="${color}" />\n`;
    const bgFill = transparentBg ? 'none' : bgColor;
    svg += `  <rect x="${x + moduleSize}" y="${y + moduleSize}" width="${patternSize - 2 * moduleSize}" height="${patternSize - 2 * moduleSize}" fill="${bgFill}" />\n`;
    svg += `  <rect x="${x + 2 * moduleSize}" y="${y + 2 * moduleSize}" width="${3 * moduleSize}" height="${3 * moduleSize}" fill="${color}" />\n`;
  }

  return svg;
}

/**
 * Optimize SVG by removing unnecessary whitespace and rounding coordinates
 */
export function optimizeSVG(svg: string, precision: number = 2): string {
  // Round all numbers to specified precision
  return svg.replace(/(\d+\.\d+)/g, (match) => {
    return parseFloat(match).toFixed(precision);
  });
}

/**
 * Convert SVG string to data URL
 */
export function svgToDataURL(svg: string): string {
  const base64 = btoa(unescape(encodeURIComponent(svg)));
  return `data:image/svg+xml;base64,${base64}`;
}
