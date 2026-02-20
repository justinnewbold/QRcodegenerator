/**
 * Shared constants for the QR Code Generator
 */

// Image loading
export const IMAGE_LOAD_TIMEOUT_MS = 10000;

// QR code generation
export const DEFAULT_LOGO_SIZE_RATIO = 0.2;
export const QR_MODULE_ARC_DIVISOR = 2.5;
export const QR_CODE_MARGIN = 4;

// Print
export const PRINT_DELAY_MS = 250;

// Batch downloads
export const BATCH_DOWNLOAD_STAGGER_MS = 300;

// UI feedback
export const COPY_FEEDBACK_DURATION_MS = 2000;

// Safe URL protocols for opening links
export const SAFE_URL_PROTOCOLS = ['http:', 'https:', 'mailto:', 'tel:', 'sms:'] as const;

/**
 * Validate that a URL uses a safe protocol before opening it.
 * Prevents javascript:, data:, and other potentially harmful schemes.
 */
export function isSafeUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return (SAFE_URL_PROTOCOLS as readonly string[]).includes(url.protocol);
  } catch {
    return false;
  }
}

/**
 * Sanitize an SVG string by parsing it and stripping dangerous elements.
 * Removes script tags, event handlers, and other XSS vectors.
 */
export function sanitizeSvg(svgString: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');

  // Check for parse errors
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) {
    return '';
  }

  const svg = doc.documentElement;

  // Remove dangerous elements
  const dangerousElements = svg.querySelectorAll(
    'script, iframe, object, embed, form, input, textarea, link[rel="import"]'
  );
  dangerousElements.forEach(el => el.remove());

  // Remove event handler attributes from all elements
  const allElements = svg.querySelectorAll('*');
  allElements.forEach(el => {
    const attrs = Array.from(el.attributes);
    attrs.forEach(attr => {
      const name = attr.name.toLowerCase();
      if (
        name.startsWith('on') || // onclick, onerror, onload, etc.
        name === 'href' && attr.value.trim().toLowerCase().startsWith('javascript:') ||
        name === 'xlink:href' && attr.value.trim().toLowerCase().startsWith('javascript:')
      ) {
        el.removeAttribute(attr.name);
      }
    });
  });

  // Serialize back to string
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svg);
}

/**
 * Safely copy text to clipboard with error handling.
 * Returns true if successful, false otherwise.
 */
export async function safeClipboardWrite(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers or denied permissions
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Load an image with a timeout to prevent hanging.
 */
export function loadImageWithTimeout(
  src: string,
  timeoutMs: number = IMAGE_LOAD_TIMEOUT_MS,
  crossOrigin?: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timeout = setTimeout(() => {
      img.src = '';
      reject(new Error(`Image load timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timeout);
      resolve(img);
    };
    img.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Image failed to load'));
    };

    if (crossOrigin) {
      img.crossOrigin = crossOrigin;
    }
    img.src = src;
  });
}
