import QRCode from 'qrcode';
import jsPDF from 'jspdf';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';
export type QRStyle = 'squares' | 'dots' | 'rounded';

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
}

export interface QRCodeResult {
  dataUrl: string;
  svg: string;
}

export async function generateQRCode(options: QRCodeOptions): Promise<QRCodeResult> {
  const {
    content,
    errorCorrectionLevel,
    size,
    foregroundColor,
    backgroundColor,
    margin,
    logoUrl,
    logoSize = 0.2,
    style = 'squares',
  } = options;

  const qrOptions = {
    errorCorrectionLevel,
    margin,
    width: size,
    color: {
      dark: foregroundColor,
      light: backgroundColor,
    },
  };

  // Generate QR code as data URL
  let dataUrl = await QRCode.toDataURL(content, qrOptions);

  // Generate SVG
  const svg = await QRCode.toString(content, {
    ...qrOptions,
    type: 'svg',
  });

  // Apply custom styling if not squares
  if (style !== 'squares') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = size;
    canvas.height = size;

    // Draw base QR code first
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

    // Clear and redraw with custom style
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = foregroundColor;

    // Calculate module size
    const moduleCount = Math.sqrt(imageData.data.length / 4);
    const moduleSize = size / moduleCount;

    // Draw with custom style
    for (let y = 0; y < moduleCount; y++) {
      for (let x = 0; x < moduleCount; x++) {
        const idx = (y * moduleCount + x) * 4;
        const isDark = imageData.data[idx] < 128;

        if (isDark) {
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
          }
        }
      }
    }

    dataUrl = canvas.toDataURL();
  }

  // If logo is provided, add it to the center
  if (logoUrl) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = size;
    canvas.height = size;

    // Draw QR code
    const qrImage = new Image();
    await new Promise((resolve, reject) => {
      qrImage.onload = resolve;
      qrImage.onerror = reject;
      qrImage.src = dataUrl;
    });
    ctx.drawImage(qrImage, 0, 0);

    // Draw logo
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

    // Draw white background for logo
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(logoX - 10, logoY - 10, logoSizePixels + 20, logoSizePixels + 20);

    // Draw logo
    ctx.drawImage(logo, logoX, logoY, logoSizePixels, logoSizePixels);

    return {
      dataUrl: canvas.toDataURL(),
      svg,
    };
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
