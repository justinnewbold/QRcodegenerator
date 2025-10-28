import QRCode from 'qrcode';
import jsPDF from 'jspdf';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type QRStyle = 'squares' | 'dots' | 'rounded';
export type FinderPattern = 'square' | 'rounded' | 'dots' | 'extra-rounded';
export type FrameStyle = 'none' | 'simple' | 'rounded' | 'banner';

export interface GradientConfig {
  enabled: boolean;
  type: 'linear' | 'radial';
  colorStart: string;
  colorEnd: string;
  rotation?: number; // degrees, for linear gradient
}

export interface QRCodeOptions {
  content: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
  logoUrl?: string;
  logoSize?: number;
  style?: QRStyle;
  gradient?: GradientConfig;
  finderPattern?: FinderPattern;
  frameStyle?: FrameStyle;
  frameText?: string;
  transparentBackground?: boolean;
}

export interface QRCodeResult {
  dataUrl: string;
  svg: string;
}

export async function generateQRCode(options: QRCodeOptions): Promise<QRCodeResult> {
  const {
    content,
    errorCorrectionLevel,
    size: baseSize,
    foregroundColor,
    backgroundColor,
    margin,
    logoUrl,
    logoSize = 0.2,
    style = 'squares',
    gradient,
    finderPattern = 'square',
    frameStyle = 'none',
    frameText,
    transparentBackground = false,
  } = options;

  // Calculate size with frame
  const frameHeight = (frameStyle !== 'none' && frameText) ? 60 : 0;
  const size = baseSize;
  const totalHeight = size + frameHeight;

  const qrOptions = {
    errorCorrectionLevel,
    margin,
    width: size,
    color: {
      dark: foregroundColor,
      light: transparentBackground ? '#00000000' : backgroundColor,
    },
  };

  // Generate base QR code as data URL
  let dataUrl = await QRCode.toDataURL(content, qrOptions);

  // Generate SVG
  const svg = await QRCode.toString(content, {
    ...qrOptions,
    type: 'svg',
  });

  // Create main canvas for custom styling
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');

  canvas.width = size;
  canvas.height = totalHeight;

  // Load base QR code
  const qrImage = new Image();
  await new Promise((resolve, reject) => {
    qrImage.onload = resolve;
    qrImage.onerror = reject;
    qrImage.src = dataUrl;
  });

  // Get QR code data for custom styling
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  if (!tempCtx) throw new Error('Could not get canvas context');

  tempCanvas.width = size;
  tempCanvas.height = size;
  tempCtx.drawImage(qrImage, 0, 0);

  const imageData = tempCtx.getImageData(0, 0, size, size);

  // Clear canvas with background
  if (transparentBackground) {
    ctx.clearRect(0, 0, size, totalHeight);
  } else {
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, totalHeight);
  }

  // Calculate module size
  const moduleCount = Math.sqrt(imageData.data.length / 4);
  const moduleSize = size / moduleCount;

  // Helper to check if position is a finder pattern corner
  const isFinderPattern = (x: number, y: number) => {
    const finderSize = 7;
    return (
      (x < finderSize && y < finderSize) || // Top-left
      (x >= moduleCount - finderSize && y < finderSize) || // Top-right
      (x < finderSize && y >= moduleCount - finderSize) // Bottom-left
    );
  };

  // Set up gradient if enabled
  if (gradient?.enabled) {
    if (gradient.type === 'linear') {
      const angle = (gradient.rotation || 0) * Math.PI / 180;
      const x1 = size / 2 - Math.cos(angle) * size / 2;
      const y1 = size / 2 - Math.sin(angle) * size / 2;
      const x2 = size / 2 + Math.cos(angle) * size / 2;
      const y2 = size / 2 + Math.sin(angle) * size / 2;
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, gradient.colorStart);
      grad.addColorStop(1, gradient.colorEnd);
      ctx.fillStyle = grad;
    } else {
      const grad = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
      grad.addColorStop(0, gradient.colorStart);
      grad.addColorStop(1, gradient.colorEnd);
      ctx.fillStyle = grad;
    }
  } else {
    ctx.fillStyle = foregroundColor;
  }

  // Draw QR modules with custom style
  for (let y = 0; y < moduleCount; y++) {
    for (let x = 0; x < moduleCount; x++) {
      const idx = (y * moduleCount + x) * 4;
      const isDark = imageData.data[idx] < 128;

      if (isDark && !isFinderPattern(x, y)) {
        const px = x * moduleSize;
        const py = y * moduleSize;

        if (style === 'dots') {
          ctx.beginPath();
          ctx.arc(px + moduleSize / 2, py + moduleSize / 2, moduleSize / 2.5, 0, 2 * Math.PI);
          ctx.fill();
        } else if (style === 'rounded') {
          const radius = moduleSize / 4;
          ctx.beginPath();
          ctx.roundRect(px, py, moduleSize, moduleSize, radius);
          ctx.fill();
        } else {
          ctx.fillRect(px, py, moduleSize, moduleSize);
        }
      }
    }
  }

  // Draw custom finder patterns
  const drawFinderPattern = (x: number, y: number) => {
    const px = x * moduleSize;
    const py = y * moduleSize;
    const patternSize = 7 * moduleSize;

    if (finderPattern === 'rounded') {
      // Outer square (rounded)
      ctx.fillStyle = foregroundColor;
      ctx.beginPath();
      ctx.roundRect(px, py, patternSize, patternSize, moduleSize);
      ctx.fill();

      // Middle square (rounded, background)
      ctx.fillStyle = transparentBackground ? 'rgba(255,255,255,0)' : backgroundColor;
      ctx.beginPath();
      ctx.roundRect(px + moduleSize, py + moduleSize, patternSize - 2 * moduleSize, patternSize - 2 * moduleSize, moduleSize / 2);
      ctx.fill();

      // Inner square (rounded, foreground)
      ctx.fillStyle = foregroundColor;
      ctx.beginPath();
      ctx.roundRect(px + 2 * moduleSize, py + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize, moduleSize / 2);
      ctx.fill();
    } else if (finderPattern === 'dots') {
      // Outer ring of dots
      ctx.fillStyle = foregroundColor;
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6) {
            ctx.beginPath();
            ctx.arc(px + i * moduleSize + moduleSize / 2, py + j * moduleSize + moduleSize / 2, moduleSize / 2.5, 0, 2 * Math.PI);
            ctx.fill();
          }
        }
      }
      // Inner center
      ctx.beginPath();
      ctx.arc(px + 3.5 * moduleSize, py + 3.5 * moduleSize, 1.5 * moduleSize, 0, 2 * Math.PI);
      ctx.fill();
    } else if (finderPattern === 'extra-rounded') {
      // Very round finder patterns
      ctx.fillStyle = foregroundColor;
      ctx.beginPath();
      ctx.roundRect(px, py, patternSize, patternSize, moduleSize * 1.5);
      ctx.fill();

      ctx.fillStyle = transparentBackground ? 'rgba(255,255,255,0)' : backgroundColor;
      ctx.beginPath();
      ctx.roundRect(px + moduleSize, py + moduleSize, patternSize - 2 * moduleSize, patternSize - 2 * moduleSize, moduleSize);
      ctx.fill();

      ctx.fillStyle = foregroundColor;
      ctx.beginPath();
      ctx.arc(px + 3.5 * moduleSize, py + 3.5 * moduleSize, 1.5 * moduleSize, 0, 2 * Math.PI);
      ctx.fill();
    } else {
      // Standard square finder pattern
      ctx.fillStyle = foregroundColor;
      ctx.fillRect(px, py, patternSize, patternSize);
      ctx.fillStyle = transparentBackground ? 'rgba(255,255,255,0)' : backgroundColor;
      ctx.fillRect(px + moduleSize, py + moduleSize, patternSize - 2 * moduleSize, patternSize - 2 * moduleSize);
      ctx.fillStyle = foregroundColor;
      ctx.fillRect(px + 2 * moduleSize, py + 2 * moduleSize, 3 * moduleSize, 3 * moduleSize);
    }
  };

  // Draw the three finder patterns
  drawFinderPattern(0, 0); // Top-left
  drawFinderPattern(moduleCount - 7, 0); // Top-right
  drawFinderPattern(0, moduleCount - 7); // Bottom-left

  // Add logo if provided
  if (logoUrl) {
    const logo = new Image();
    logo.crossOrigin = 'anonymous';
    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = reject;
      logo.src = logoUrl;
    });

    const logoSizePixels = size * logoSize;
    const logoX = (size - logoSizePixels) / 2;
    const logoY = (size - logoSizePixels) / 2;

    // Draw background for logo
    if (!transparentBackground) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(logoX - 10, logoY - 10, logoSizePixels + 20, logoSizePixels + 20);
    }

    // Draw logo
    ctx.drawImage(logo, logoX, logoY, logoSizePixels, logoSizePixels);
  }

  // Add frame and text if specified
  if (frameStyle !== 'none' && frameText) {
    const frameCanvas = document.createElement('canvas');
    const frameCtx = frameCanvas.getContext('2d');
    if (!frameCtx) throw new Error('Could not get canvas context');

    frameCanvas.width = size;
    frameCanvas.height = totalHeight;

    // Draw QR code on frame canvas
    if (transparentBackground) {
      frameCtx.clearRect(0, 0, size, totalHeight);
    } else {
      frameCtx.fillStyle = backgroundColor;
      frameCtx.fillRect(0, 0, size, totalHeight);
    }
    frameCtx.drawImage(canvas, 0, 0);

    // Draw frame based on style
    if (frameStyle === 'simple') {
      frameCtx.fillStyle = foregroundColor;
      frameCtx.fillRect(0, size, size, frameHeight);
      frameCtx.fillStyle = '#ffffff';
      frameCtx.font = 'bold 20px Arial';
      frameCtx.textAlign = 'center';
      frameCtx.textBaseline = 'middle';
      frameCtx.fillText(frameText, size / 2, size + frameHeight / 2);
    } else if (frameStyle === 'rounded') {
      frameCtx.fillStyle = foregroundColor;
      frameCtx.beginPath();
      frameCtx.roundRect(10, size + 10, size - 20, frameHeight - 20, 10);
      frameCtx.fill();
      frameCtx.fillStyle = '#ffffff';
      frameCtx.font = 'bold 18px Arial';
      frameCtx.textAlign = 'center';
      frameCtx.textBaseline = 'middle';
      frameCtx.fillText(frameText, size / 2, size + frameHeight / 2);
    } else if (frameStyle === 'banner') {
      // Draw banner ribbon
      frameCtx.fillStyle = foregroundColor;
      frameCtx.beginPath();
      frameCtx.moveTo(0, size + 15);
      frameCtx.lineTo(size, size + 15);
      frameCtx.lineTo(size, size + frameHeight - 15);
      frameCtx.lineTo(0, size + frameHeight - 15);
      frameCtx.closePath();
      frameCtx.fill();
      frameCtx.fillStyle = '#ffffff';
      frameCtx.font = 'bold 20px Arial';
      frameCtx.textAlign = 'center';
      frameCtx.textBaseline = 'middle';
      frameCtx.fillText(frameText, size / 2, size + frameHeight / 2);
    }

    dataUrl = frameCanvas.toDataURL();
  } else {
    dataUrl = canvas.toDataURL();
  }

  return { dataUrl, svg };
}

export function generateWiFiString(
  ssid: string,
  password: string,
  encryption: 'WPA' | 'WEP' | 'nopass'
): string {
  return `WIFI:T:${encryption};S:${ssid};P:${password};;`;
}

export function generateVCardString(data: {
  firstName: string;
  lastName: string;
  organization?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
}): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${data.lastName};${data.firstName};;;`,
    `FN:${data.firstName} ${data.lastName}`,
  ];

  if (data.organization) lines.push(`ORG:${data.organization}`);
  if (data.phone) lines.push(`TEL:${data.phone}`);
  if (data.email) lines.push(`EMAIL:${data.email}`);
  if (data.website) lines.push(`URL:${data.website}`);
  if (data.address) lines.push(`ADR:;;${data.address};;;;`);

  lines.push('END:VCARD');
  return lines.join('\n');
}

export function generateEmailString(email: string, subject?: string, body?: string): string {
  let result = `mailto:${email}`;
  const params: string[] = [];

  if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
  if (body) params.push(`body=${encodeURIComponent(body)}`);

  if (params.length > 0) {
    result += '?' + params.join('&');
  }

  return result;
}

export function generateSMSString(phone: string, message?: string): string {
  let result = `sms:${phone}`;
  if (message) {
    result += `?body=${encodeURIComponent(message)}`;
  }
  return result;
}

export function generatePhoneString(phone: string): string {
  return `tel:${phone}`;
}

export function generateCalendarString(data: {
  title: string;
  location?: string;
  startDate: string;
  endDate: string;
  description?: string;
}): string {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'BEGIN:VEVENT',
    `SUMMARY:${data.title}`,
    `DTSTART:${formatDate(data.startDate)}`,
    `DTEND:${formatDate(data.endDate)}`,
  ];

  if (data.location) lines.push(`LOCATION:${data.location}`);
  if (data.description) lines.push(`DESCRIPTION:${data.description}`);

  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');
  return lines.join('\n');
}

export function generateCryptoString(address: string, amount?: string, label?: string): string {
  // Support Bitcoin, Ethereum, and other crypto addresses
  // Bitcoin uses bitcoin: scheme, Ethereum uses ethereum: scheme
  let result = address;

  // If it looks like a Bitcoin address, add bitcoin: prefix
  if (address.match(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/) || address.match(/^bc1[a-z0-9]{39,59}$/)) {
    result = `bitcoin:${address}`;
    const params: string[] = [];
    if (amount) params.push(`amount=${amount}`);
    if (label) params.push(`label=${encodeURIComponent(label)}`);
    if (params.length > 0) result += '?' + params.join('&');
  }
  // If it looks like an Ethereum address, add ethereum: prefix
  else if (address.match(/^0x[a-fA-F0-9]{40}$/)) {
    result = `ethereum:${address}`;
    if (amount) result += `@1?value=${amount}`;
  }

  return result;
}

export function generateAppStoreString(platform: 'ios' | 'android', appId: string): string {
  if (platform === 'ios') {
    return `https://apps.apple.com/app/id${appId}`;
  } else {
    return `https://play.google.com/store/apps/details?id=${appId}`;
  }
}

export function generateSocialMediaString(platform: string, username: string): string {
  const cleanUsername = username.replace('@', '');

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/${cleanUsername}`;
    case 'instagram':
      return `https://instagram.com/${cleanUsername}`;
    case 'linkedin':
      return username.startsWith('http') ? username : `https://linkedin.com/in/${cleanUsername}`;
    case 'facebook':
      return `https://facebook.com/${cleanUsername}`;
    case 'tiktok':
      return `https://tiktok.com/@${cleanUsername}`;
    case 'youtube':
      return username.startsWith('http') ? username : `https://youtube.com/@${cleanUsername}`;
    default:
      return username;
  }
}

export function generateLocationString(latitude: string, longitude: string, label?: string): string {
  // Google Maps format: geo:latitude,longitude?q=latitude,longitude(label)
  let result = `geo:${latitude},${longitude}`;
  if (label) {
    result += `?q=${latitude},${longitude}(${encodeURIComponent(label)})`;
  }
  return result;
}

export function generatePDF(dataUrl: string, filename: string = 'qrcode.pdf'): void {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // A4 dimensions
  const pageWidth = 210;
  const pageHeight = 297;

  // QR code size in mm (making it nice and large)
  const qrSize = 100;

  // Center the QR code
  const x = (pageWidth - qrSize) / 2;
  const y = (pageHeight - qrSize) / 2;

  // Add QR code to PDF
  pdf.addImage(dataUrl, 'PNG', x, y, qrSize, qrSize);

  // Download the PDF
  pdf.save(filename);
}
