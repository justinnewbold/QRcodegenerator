/**
 * Shareable Links System
 * Encode/decode QR code settings into shareable URLs
 */

export interface ShareableQRConfig {
  // Content
  type: string;
  content: string;

  // Style
  size?: number;
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
  foregroundColor?: string;
  backgroundColor?: string;
  margin?: number;
  dotStyle?: string;
  cornerStyle?: string;

  // Advanced
  logoUrl?: string;
  frameStyle?: string;
  frameText?: string;

  // Gradient
  useGradient?: boolean;
  gradientType?: string;
  gradientColors?: string[];

  // Metadata
  name?: string;
}

// Short keys for URL compression
const KEY_MAP: Record<keyof ShareableQRConfig, string> = {
  type: 't',
  content: 'c',
  size: 's',
  errorCorrection: 'e',
  foregroundColor: 'fg',
  backgroundColor: 'bg',
  margin: 'm',
  dotStyle: 'd',
  cornerStyle: 'cs',
  logoUrl: 'l',
  frameStyle: 'fs',
  frameText: 'ft',
  useGradient: 'ug',
  gradientType: 'gt',
  gradientColors: 'gc',
  name: 'n',
};

// Reverse key map
const REVERSE_KEY_MAP: Record<string, keyof ShareableQRConfig> = Object.fromEntries(
  Object.entries(KEY_MAP).map(([k, v]) => [v, k as keyof ShareableQRConfig])
);

/**
 * Encode QR config into a URL-safe string
 */
export function encodeQRConfig(config: ShareableQRConfig): string {
  const minified: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(config)) {
    if (value !== undefined && value !== null && value !== '') {
      const shortKey = KEY_MAP[key as keyof ShareableQRConfig] || key;

      // Color compression (remove # prefix)
      if (key.includes('Color') && typeof value === 'string' && value.startsWith('#')) {
        minified[shortKey] = value.slice(1);
      } else {
        minified[shortKey] = value;
      }
    }
  }

  // Use base64url encoding for URL safety
  const json = JSON.stringify(minified);
  const encoded = btoa(json)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return encoded;
}

/**
 * Decode a URL-safe string into QR config
 */
export function decodeQRConfig(encoded: string): ShareableQRConfig | null {
  try {
    // Restore base64 padding
    let padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (padded.length % 4) {
      padded += '=';
    }

    const json = atob(padded);
    const minified = JSON.parse(json);
    const config: Partial<ShareableQRConfig> = {};

    for (const [shortKey, value] of Object.entries(minified)) {
      const fullKey = REVERSE_KEY_MAP[shortKey] || shortKey;

      // Restore color # prefix
      if (fullKey.includes('Color') && typeof value === 'string' && !value.startsWith('#')) {
        (config as Record<string, unknown>)[fullKey] = `#${value}`;
      } else {
        (config as Record<string, unknown>)[fullKey] = value;
      }
    }

    // Validate required fields
    if (!config.type || !config.content) {
      return null;
    }

    return config as ShareableQRConfig;
  } catch (error) {
    console.error('Failed to decode QR config:', error);
    return null;
  }
}

/**
 * Generate a shareable URL for a QR config
 */
export function generateShareableUrl(config: ShareableQRConfig): string {
  const encoded = encodeQRConfig(config);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  return `${baseUrl}/?qr=${encoded}`;
}

/**
 * Parse QR config from current URL
 */
export function parseShareableUrl(): ShareableQRConfig | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('qr');

  if (!encoded) return null;

  return decodeQRConfig(encoded);
}

/**
 * Copy shareable URL to clipboard
 */
export async function copyShareableUrl(config: ShareableQRConfig): Promise<boolean> {
  try {
    const url = generateShareableUrl(config);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy URL:', error);
    return false;
  }
}

/**
 * Generate a short hash for the config (for display purposes)
 */
export function generateConfigHash(config: ShareableQRConfig): string {
  const encoded = encodeQRConfig(config);
  // Take first 8 characters of the encoded string
  return encoded.slice(0, 8);
}

/**
 * Check if current URL has a shared QR config
 */
export function hasSharedConfig(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.has('qr');
}

/**
 * Clear shared config from URL without reload
 */
export function clearSharedConfigFromUrl(): void {
  if (typeof window === 'undefined') return;

  const url = new URL(window.location.href);
  url.searchParams.delete('qr');
  window.history.replaceState({}, '', url.toString());
}

/**
 * Create a shortened shareable link (simulation - would need backend)
 * For now, returns the full URL
 */
export function createShortLink(config: ShareableQRConfig): Promise<string> {
  // In a real implementation, this would call a URL shortening API
  // For now, just return the full URL
  return Promise.resolve(generateShareableUrl(config));
}

/**
 * Validate a shareable config
 */
export function validateShareableConfig(config: ShareableQRConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.type) {
    errors.push('QR type is required');
  }

  if (!config.content) {
    errors.push('Content is required');
  }

  if (config.size && (config.size < 100 || config.size > 2000)) {
    errors.push('Size must be between 100 and 2000 pixels');
  }

  if (config.margin && (config.margin < 0 || config.margin > 20)) {
    errors.push('Margin must be between 0 and 20');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
