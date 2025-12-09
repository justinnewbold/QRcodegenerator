/**
 * Social Media Export & Business Card Generator
 * Optimized exports for various platforms and use cases
 */

export interface SocialMediaSize {
  id: string;
  name: string;
  platform: string;
  width: number;
  height: number;
  qrSize: number;
  qrPosition: 'center' | 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  padding: number;
  description: string;
}

export interface EmailSignatureConfig {
  qrSize: number;
  alignment: 'left' | 'center' | 'right';
  includeText: boolean;
  text?: string;
  textPosition: 'above' | 'below';
  borderRadius: number;
  backgroundColor?: string;
  padding: number;
}

export interface BusinessCardLayout {
  id: string;
  name: string;
  width: number; // mm
  height: number; // mm
  orientation: 'landscape' | 'portrait';
  qrSize: number; // mm
  qrPosition: { x: number; y: number }; // mm from top-left
  fields: BusinessCardField[];
  style: {
    backgroundColor: string;
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
}

export interface BusinessCardField {
  id: string;
  type: 'name' | 'title' | 'company' | 'email' | 'phone' | 'website' | 'address' | 'custom';
  label?: string;
  value: string;
  position: { x: number; y: number }; // mm
  fontSize: number; // pt
  fontWeight: 'normal' | 'bold';
  color: string;
  alignment: 'left' | 'center' | 'right';
}

// ============================================
// Social Media Sizes
// ============================================

export const SOCIAL_MEDIA_SIZES: SocialMediaSize[] = [
  // Instagram
  {
    id: 'instagram-post',
    name: 'Instagram Post',
    platform: 'Instagram',
    width: 1080,
    height: 1080,
    qrSize: 400,
    qrPosition: 'center',
    padding: 100,
    description: 'Square post for Instagram feed',
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    platform: 'Instagram',
    width: 1080,
    height: 1920,
    qrSize: 500,
    qrPosition: 'center',
    padding: 150,
    description: 'Vertical format for Stories',
  },
  {
    id: 'instagram-reel',
    name: 'Instagram Reel Cover',
    platform: 'Instagram',
    width: 1080,
    height: 1920,
    qrSize: 450,
    qrPosition: 'center',
    padding: 100,
    description: 'Cover image for Reels',
  },

  // Facebook
  {
    id: 'facebook-post',
    name: 'Facebook Post',
    platform: 'Facebook',
    width: 1200,
    height: 630,
    qrSize: 300,
    qrPosition: 'center',
    padding: 80,
    description: 'Optimal size for Facebook posts',
  },
  {
    id: 'facebook-cover',
    name: 'Facebook Cover',
    platform: 'Facebook',
    width: 820,
    height: 312,
    qrSize: 200,
    qrPosition: 'bottom-right',
    padding: 20,
    description: 'Facebook page cover photo',
  },
  {
    id: 'facebook-event',
    name: 'Facebook Event',
    platform: 'Facebook',
    width: 1920,
    height: 1080,
    qrSize: 400,
    qrPosition: 'bottom-right',
    padding: 50,
    description: 'Event cover image',
  },

  // Twitter/X
  {
    id: 'twitter-post',
    name: 'Twitter/X Post',
    platform: 'Twitter',
    width: 1200,
    height: 675,
    qrSize: 300,
    qrPosition: 'center',
    padding: 80,
    description: 'In-feed image post',
  },
  {
    id: 'twitter-header',
    name: 'Twitter/X Header',
    platform: 'Twitter',
    width: 1500,
    height: 500,
    qrSize: 250,
    qrPosition: 'bottom-right',
    padding: 30,
    description: 'Profile header image',
  },

  // LinkedIn
  {
    id: 'linkedin-post',
    name: 'LinkedIn Post',
    platform: 'LinkedIn',
    width: 1200,
    height: 627,
    qrSize: 300,
    qrPosition: 'center',
    padding: 80,
    description: 'Shared image post',
  },
  {
    id: 'linkedin-banner',
    name: 'LinkedIn Banner',
    platform: 'LinkedIn',
    width: 1584,
    height: 396,
    qrSize: 200,
    qrPosition: 'bottom-right',
    padding: 30,
    description: 'Profile banner image',
  },

  // YouTube
  {
    id: 'youtube-thumbnail',
    name: 'YouTube Thumbnail',
    platform: 'YouTube',
    width: 1280,
    height: 720,
    qrSize: 200,
    qrPosition: 'bottom-right',
    padding: 30,
    description: 'Video thumbnail',
  },
  {
    id: 'youtube-banner',
    name: 'YouTube Banner',
    platform: 'YouTube',
    width: 2560,
    height: 1440,
    qrSize: 400,
    qrPosition: 'bottom-right',
    padding: 100,
    description: 'Channel banner',
  },

  // Pinterest
  {
    id: 'pinterest-pin',
    name: 'Pinterest Pin',
    platform: 'Pinterest',
    width: 1000,
    height: 1500,
    qrSize: 350,
    qrPosition: 'bottom-right',
    padding: 50,
    description: 'Optimal pin size',
  },

  // TikTok
  {
    id: 'tiktok-video',
    name: 'TikTok Video',
    platform: 'TikTok',
    width: 1080,
    height: 1920,
    qrSize: 400,
    qrPosition: 'center',
    padding: 100,
    description: 'Video overlay or end screen',
  },

  // Print
  {
    id: 'poster-a4',
    name: 'A4 Poster',
    platform: 'Print',
    width: 2480,
    height: 3508,
    qrSize: 800,
    qrPosition: 'center',
    padding: 200,
    description: 'A4 size at 300 DPI',
  },
  {
    id: 'flyer-a5',
    name: 'A5 Flyer',
    platform: 'Print',
    width: 1748,
    height: 2480,
    qrSize: 600,
    qrPosition: 'center',
    padding: 150,
    description: 'A5 size at 300 DPI',
  },
  {
    id: 'business-card',
    name: 'Business Card',
    platform: 'Print',
    width: 1050,
    height: 600,
    qrSize: 250,
    qrPosition: 'bottom-right',
    padding: 30,
    description: 'Standard business card at 300 DPI',
  },
];

// ============================================
// Business Card Templates
// ============================================

export const BUSINESS_CARD_TEMPLATES: BusinessCardLayout[] = [
  {
    id: 'classic-horizontal',
    name: 'Classic Horizontal',
    width: 89,
    height: 51,
    orientation: 'landscape',
    qrSize: 25,
    qrPosition: { x: 60, y: 13 },
    fields: [
      { id: 'name', type: 'name', value: '', position: { x: 5, y: 10 }, fontSize: 14, fontWeight: 'bold', color: '#000000', alignment: 'left' },
      { id: 'title', type: 'title', value: '', position: { x: 5, y: 18 }, fontSize: 10, fontWeight: 'normal', color: '#666666', alignment: 'left' },
      { id: 'company', type: 'company', value: '', position: { x: 5, y: 25 }, fontSize: 11, fontWeight: 'bold', color: '#333333', alignment: 'left' },
      { id: 'email', type: 'email', value: '', position: { x: 5, y: 35 }, fontSize: 9, fontWeight: 'normal', color: '#333333', alignment: 'left' },
      { id: 'phone', type: 'phone', value: '', position: { x: 5, y: 41 }, fontSize: 9, fontWeight: 'normal', color: '#333333', alignment: 'left' },
    ],
    style: {
      backgroundColor: '#FFFFFF',
      primaryColor: '#000000',
      secondaryColor: '#666666',
      fontFamily: 'Arial, sans-serif',
    },
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    width: 89,
    height: 51,
    orientation: 'landscape',
    qrSize: 30,
    qrPosition: { x: 54, y: 10 },
    fields: [
      { id: 'name', type: 'name', value: '', position: { x: 5, y: 15 }, fontSize: 16, fontWeight: 'bold', color: '#1a1a1a', alignment: 'left' },
      { id: 'title', type: 'title', value: '', position: { x: 5, y: 24 }, fontSize: 10, fontWeight: 'normal', color: '#888888', alignment: 'left' },
      { id: 'email', type: 'email', value: '', position: { x: 5, y: 38 }, fontSize: 8, fontWeight: 'normal', color: '#333333', alignment: 'left' },
      { id: 'phone', type: 'phone', value: '', position: { x: 5, y: 44 }, fontSize: 8, fontWeight: 'normal', color: '#333333', alignment: 'left' },
    ],
    style: {
      backgroundColor: '#FFFFFF',
      primaryColor: '#1a1a1a',
      secondaryColor: '#888888',
      fontFamily: 'Helvetica, Arial, sans-serif',
    },
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    width: 89,
    height: 51,
    orientation: 'landscape',
    qrSize: 22,
    qrPosition: { x: 63, y: 14 },
    fields: [
      { id: 'company', type: 'company', value: '', position: { x: 5, y: 8 }, fontSize: 12, fontWeight: 'bold', color: '#0066CC', alignment: 'left' },
      { id: 'name', type: 'name', value: '', position: { x: 5, y: 20 }, fontSize: 13, fontWeight: 'bold', color: '#333333', alignment: 'left' },
      { id: 'title', type: 'title', value: '', position: { x: 5, y: 28 }, fontSize: 9, fontWeight: 'normal', color: '#666666', alignment: 'left' },
      { id: 'email', type: 'email', value: '', position: { x: 5, y: 38 }, fontSize: 8, fontWeight: 'normal', color: '#333333', alignment: 'left' },
      { id: 'phone', type: 'phone', value: '', position: { x: 5, y: 44 }, fontSize: 8, fontWeight: 'normal', color: '#333333', alignment: 'left' },
    ],
    style: {
      backgroundColor: '#FFFFFF',
      primaryColor: '#0066CC',
      secondaryColor: '#666666',
      fontFamily: 'Arial, sans-serif',
    },
  },
  {
    id: 'vertical-elegant',
    name: 'Vertical Elegant',
    width: 51,
    height: 89,
    orientation: 'portrait',
    qrSize: 28,
    qrPosition: { x: 11, y: 55 },
    fields: [
      { id: 'name', type: 'name', value: '', position: { x: 25, y: 15 }, fontSize: 12, fontWeight: 'bold', color: '#2c2c2c', alignment: 'center' },
      { id: 'title', type: 'title', value: '', position: { x: 25, y: 23 }, fontSize: 8, fontWeight: 'normal', color: '#888888', alignment: 'center' },
      { id: 'email', type: 'email', value: '', position: { x: 25, y: 35 }, fontSize: 7, fontWeight: 'normal', color: '#444444', alignment: 'center' },
      { id: 'phone', type: 'phone', value: '', position: { x: 25, y: 42 }, fontSize: 7, fontWeight: 'normal', color: '#444444', alignment: 'center' },
    ],
    style: {
      backgroundColor: '#FAFAFA',
      primaryColor: '#2c2c2c',
      secondaryColor: '#888888',
      fontFamily: 'Georgia, serif',
    },
  },
];

// ============================================
// Export Functions
// ============================================

/**
 * Get social media size by ID
 */
export function getSocialMediaSize(id: string): SocialMediaSize | undefined {
  return SOCIAL_MEDIA_SIZES.find(s => s.id === id);
}

/**
 * Get sizes by platform
 */
export function getSizesByPlatform(platform: string): SocialMediaSize[] {
  return SOCIAL_MEDIA_SIZES.filter(s => s.platform === platform);
}

/**
 * Get all platforms
 */
export function getAllPlatforms(): string[] {
  return Array.from(new Set(SOCIAL_MEDIA_SIZES.map(s => s.platform)));
}

/**
 * Generate email signature HTML
 */
export function generateEmailSignatureHTML(
  qrDataUrl: string,
  config: EmailSignatureConfig,
  qrLink?: string
): string {
  const imgStyle = `
    width: ${config.qrSize}px;
    height: ${config.qrSize}px;
    border-radius: ${config.borderRadius}px;
    ${config.backgroundColor ? `background-color: ${config.backgroundColor};` : ''}
    padding: ${config.padding}px;
  `.replace(/\s+/g, ' ').trim();

  const containerStyle = `
    text-align: ${config.alignment};
    font-family: Arial, sans-serif;
  `.replace(/\s+/g, ' ').trim();

  const textStyle = `
    font-size: 12px;
    color: #666666;
    margin: ${config.textPosition === 'above' ? '0 0 8px 0' : '8px 0 0 0'};
  `.replace(/\s+/g, ' ').trim();

  let html = `<div style="${containerStyle}">`;

  if (config.includeText && config.text && config.textPosition === 'above') {
    html += `<p style="${textStyle}">${config.text}</p>`;
  }

  if (qrLink) {
    html += `<a href="${qrLink}" target="_blank">`;
  }

  html += `<img src="${qrDataUrl}" alt="QR Code" style="${imgStyle}" />`;

  if (qrLink) {
    html += `</a>`;
  }

  if (config.includeText && config.text && config.textPosition === 'below') {
    html += `<p style="${textStyle}">${config.text}</p>`;
  }

  html += `</div>`;

  return html;
}

/**
 * Generate business card SVG
 */
export function generateBusinessCardSVG(
  layout: BusinessCardLayout,
  qrSvg: string,
  fieldValues: Record<string, string>
): string {
  const dpi = 300;
  const mmToPixel = (mm: number) => Math.round((mm * dpi) / 25.4);

  const width = mmToPixel(layout.width);
  const height = mmToPixel(layout.height);
  const qrSize = mmToPixel(layout.qrSize);
  const qrX = mmToPixel(layout.qrPosition.x);
  const qrY = mmToPixel(layout.qrPosition.y);

  let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${layout.style.backgroundColor}"/>

  <!-- QR Code -->
  <g transform="translate(${qrX}, ${qrY})">
    <g transform="scale(${qrSize / 300})">
      ${qrSvg.replace(/<\?xml[^?]*\?>/g, '').replace(/<svg[^>]*>/g, '').replace(/<\/svg>/g, '')}
    </g>
  </g>

  <!-- Fields -->`;

  layout.fields.forEach(field => {
    const value = fieldValues[field.type] || field.value;
    if (!value) return;

    const x = mmToPixel(field.position.x);
    const y = mmToPixel(field.position.y);
    const fontSize = Math.round(field.fontSize * (dpi / 72)); // Convert pt to pixels

    let textAnchor = 'start';
    if (field.alignment === 'center') textAnchor = 'middle';
    if (field.alignment === 'right') textAnchor = 'end';

    svg += `
  <text x="${x}" y="${y}" font-family="${layout.style.fontFamily}" font-size="${fontSize}" font-weight="${field.fontWeight}" fill="${field.color}" text-anchor="${textAnchor}">${escapeXml(value)}</text>`;
  });

  svg += `
</svg>`;

  return svg;
}

/**
 * Escape XML special characters
 */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Get business card template by ID
 */
export function getBusinessCardTemplate(id: string): BusinessCardLayout | undefined {
  return BUSINESS_CARD_TEMPLATES.find(t => t.id === id);
}

/**
 * Calculate position for QR code in social media image
 */
export function calculateQRPosition(
  size: SocialMediaSize
): { x: number; y: number } {
  const { width, height, qrSize, qrPosition, padding } = size;

  switch (qrPosition) {
    case 'center':
      return {
        x: (width - qrSize) / 2,
        y: (height - qrSize) / 2,
      };
    case 'bottom-right':
      return {
        x: width - qrSize - padding,
        y: height - qrSize - padding,
      };
    case 'bottom-left':
      return {
        x: padding,
        y: height - qrSize - padding,
      };
    case 'top-right':
      return {
        x: width - qrSize - padding,
        y: padding,
      };
    case 'top-left':
      return {
        x: padding,
        y: padding,
      };
    default:
      return {
        x: (width - qrSize) / 2,
        y: (height - qrSize) / 2,
      };
  }
}
