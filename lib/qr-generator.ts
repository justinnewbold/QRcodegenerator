import QRCode from 'qrcode';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export interface QRCodeOptions {
  content: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  size: number;
  foregroundColor: string;
  backgroundColor: string;
  margin: number;
  logoUrl?: string;
  logoSize?: number;
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
  const dataUrl = await QRCode.toDataURL(content, qrOptions);

  // Generate SVG
  const svg = await QRCode.toString(content, {
    ...qrOptions,
    type: 'svg',
  });

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

export function generateEventString(data: {
  title: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  description?: string;
}): string {
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const lines = [
    'BEGIN:VEVENT',
    `SUMMARY:${data.title}`,
    `DTSTART:${formatDate(data.startDate)}`,
    `DTEND:${formatDate(data.endDate)}`,
  ];

  if (data.location) lines.push(`LOCATION:${data.location}`);
  if (data.description) lines.push(`DESCRIPTION:${data.description}`);

  lines.push('END:VEVENT');
  return lines.join('\n');
}
