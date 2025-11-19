// Accessibility features for QR code generation

export interface AccessibilityOptions {
  highContrast?: boolean
  colorBlindSafe?: boolean
  largeSize?: boolean
  tactileReady?: boolean
  screenReaderOptimized?: boolean
}

// Color-blind safe palettes
export const COLOR_BLIND_SAFE_PALETTES = {
  protanopia: {
    // Red-blind
    foreground: '#0173B2', // Blue
    background: '#FFFFFF',
    accent: '#DE8F05', // Orange
  },
  deuteranopia: {
    // Green-blind
    foreground: '#0173B2', // Blue
    background: '#FFFFFF',
    accent: '#DE8F05', // Orange
  },
  tritanopia: {
    // Blue-blind
    foreground: '#CC79A7', // Magenta
    background: '#FFFFFF',
    accent: '#D55E00', // Red-orange
  },
  monochromacy: {
    // Complete color blindness
    foreground: '#000000',
    background: '#FFFFFF',
    accent: '#666666',
  },
}

// High contrast preset
export const HIGH_CONTRAST_PRESET = {
  foreground: '#000000',
  background: '#FFFFFF',
  errorCorrection: 'H' as const, // Highest error correction
  margin: 6, // Larger quiet zone
}

// Tactile QR code specifications (for 3D printing/embossing)
export const TACTILE_SPECIFICATIONS = {
  minModuleSize: 5, // mm
  reliefHeight: 0.8, // mm
  smoothEdges: true,
  highContrast: true,
}

export function getAccessibleQRConfig(options: AccessibilityOptions) {
  const config: any = {}

  if (options.highContrast) {
    Object.assign(config, HIGH_CONTRAST_PRESET)
  }

  if (options.colorBlindSafe) {
    // Default to deuteranopia (most common)
    const palette = COLOR_BLIND_SAFE_PALETTES.deuteranopia
    config.foregroundColor = palette.foreground
    config.backgroundColor = palette.background
  }

  if (options.largeSize) {
    config.size = 500 // Larger for visibility
    config.margin = 6
  }

  if (options.tactileReady) {
    config.size = 1000 // High resolution for printing
    config.errorCorrectionLevel = 'H'
    Object.assign(config, HIGH_CONTRAST_PRESET)
  }

  if (options.screenReaderOptimized) {
    // Add metadata for screen readers
    config.alt = 'QR Code containing scannable information'
    config.ariaLabel = 'QR Code - scan with camera to access content'
  }

  return config
}

// WCAG 2.1 AA contrast checker
export function checkContrast(foreground: string, background: string): {
  ratio: number
  passAA: boolean
  passAAA: boolean
} {
  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  const ratio = (lighter + 0.05) / (darker + 0.05)

  return {
    ratio,
    passAA: ratio >= 4.5, // WCAG AA requirement
    passAAA: ratio >= 7, // WCAG AAA requirement
  }
}

function getLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16)
  const r = ((rgb >> 16) & 0xff) / 255
  const g = ((rgb >> 8) & 0xff) / 255
  const b = (rgb & 0xff) / 255

  const [rs, gs, bs] = [r, g, b].map((c) => {
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

// Generate alt text for QR codes
export function generateAltText(content: string, type: string): string {
  const prefix = 'QR Code containing'

  switch (type.toLowerCase()) {
    case 'url':
      return `${prefix} link to ${new URL(content).hostname}`
    case 'email':
      return `${prefix} email address ${content}`
    case 'phone':
      return `${prefix} phone number ${content}`
    case 'wifi':
      return `${prefix} WiFi network credentials`
    case 'vcard':
      return `${prefix} contact information`
    case 'event':
      return `${prefix} calendar event details`
    default:
      return `${prefix} scannable text information`
  }
}

// Screen reader friendly QR code wrapper
export function generateAccessibleHTML(
  qrImageSrc: string,
  content: string,
  type: string
): string {
  const altText = generateAltText(content, type)

  return `
<figure role="img" aria-label="${altText}">
  <img
    src="${qrImageSrc}"
    alt="${altText}"
    aria-describedby="qr-description"
  />
  <figcaption id="qr-description" class="sr-only">
    Scan this QR code with your mobile device to access: ${content}
  </figcaption>
</figure>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>
  `.trim()
}
