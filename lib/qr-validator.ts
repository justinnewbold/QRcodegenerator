import { ErrorCorrectionLevel } from './qr-generator';

export interface QRValidationResult {
  overallScore: number; // 0-100
  scannability: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
  contrast: {
    ratio: number;
    score: number;
    passed: boolean;
  };
  size: {
    recommendedDistance: string;
    moduleSize: number;
    score: number;
  };
  logo: {
    percentageOfQR: number;
    score: number;
    warning?: string;
  };
  errorCorrection: {
    level: ErrorCorrectionLevel;
    capacity: string;
    recommendation: string;
  };
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const getLuminance = (color: string): number => {
    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Calculate relative luminance
    const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB;
  };

  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Calculate recommended scan distance based on QR code size
export function getRecommendedScanDistance(size: number): string {
  // Rule of thumb: QR code should be at least 10% of the distance
  // So a 300px QR code can be scanned from ~3 meters
  const inches = size / 96; // Assuming 96 DPI
  const distanceInches = inches * 10;
  const distanceFeet = Math.round(distanceInches / 12);
  const distanceMeters = (distanceFeet * 0.3048).toFixed(1);

  if (distanceFeet < 1) {
    return 'Close range (< 1 foot)';
  } else if (distanceFeet < 3) {
    return `${distanceFeet} feet (~${distanceMeters}m)`;
  } else {
    return `${distanceFeet} feet (~${distanceMeters}m)`;
  }
}

// Validate QR code and return detailed results
export function validateQRCode(
  fgColor: string,
  bgColor: string,
  size: number,
  errorLevel: ErrorCorrectionLevel,
  logoSize: number = 0,
  hasLogo: boolean = false,
  contentLength: number = 0
): QRValidationResult {
  const issues: string[] = [];
  const recommendations: string[] = [];
  let scores: number[] = [];

  // 1. Contrast Ratio Check
  const contrastRatio = getContrastRatio(fgColor, bgColor);
  const contrastPassed = contrastRatio >= 3; // Minimum for readability
  const contrastScore = Math.min(100, (contrastRatio / 7) * 100); // 7:1 is excellent

  if (contrastRatio < 3) {
    issues.push('Low contrast ratio - QR code may be difficult to scan');
    recommendations.push('Increase contrast between foreground and background colors');
  } else if (contrastRatio < 4.5) {
    recommendations.push('Consider increasing contrast for better reliability');
  }

  scores.push(contrastScore);

  // 2. Size Check
  const moduleSize = size / 33; // Approximate modules in a typical QR code
  let sizeScore = 100;

  if (size < 200) {
    issues.push('QR code is very small - may be hard to scan from distance');
    recommendations.push('Increase size to at least 200px for better scannability');
    sizeScore = 50;
  } else if (size < 300) {
    recommendations.push('Consider using 300px or larger for better scan distance');
    sizeScore = 75;
  }

  scores.push(sizeScore);

  // 3. Logo Size Check
  const logoPercentage = logoSize * 100;
  let logoScore = 100;
  let logoWarning: string | undefined;

  if (hasLogo) {
    if (logoPercentage > 30) {
      issues.push('Logo is too large - may prevent scanning');
      recommendations.push('Reduce logo size to 20-30% or use higher error correction');
      logoScore = 30;
      logoWarning = 'Logo is too large and may block too much of the QR code';
    } else if (logoPercentage > 20 && errorLevel === 'L') {
      issues.push('Logo size requires higher error correction');
      recommendations.push('Use at least Medium error correction with logos');
      logoScore = 60;
      logoWarning = 'Recommend higher error correction with this logo size';
    } else if (logoPercentage > 25) {
      recommendations.push('Consider slightly smaller logo for more reliable scanning');
      logoScore = 80;
    }

    scores.push(logoScore);
  }

  // 4. Error Correction Analysis
  let errorCorrectionCapacity = '';
  let errorCorrectionRec = '';

  switch (errorLevel) {
    case 'L':
      errorCorrectionCapacity = '7% damage recovery';
      errorCorrectionRec = hasLogo
        ? 'Upgrade to M or Q for logos'
        : 'Good for clean, indoor use';
      break;
    case 'M':
      errorCorrectionCapacity = '15% damage recovery';
      errorCorrectionRec = 'Good balance for most uses';
      break;
    case 'Q':
      errorCorrectionCapacity = '25% damage recovery';
      errorCorrectionRec = 'Recommended for outdoor use';
      break;
    case 'H':
      errorCorrectionCapacity = '30% damage recovery';
      errorCorrectionRec = 'Best for logos and harsh conditions';
      break;
  }

  // 5. Content Length Analysis
  if (contentLength > 500) {
    issues.push('Large amount of data may create dense QR code');
    recommendations.push('Consider using URL shortener to reduce data size');
  }

  // 6. Calculate Overall Scannability Score
  const scannabilityScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  // 7. Calculate Overall Score
  const overallScore = Math.round(scannabilityScore);

  return {
    overallScore,
    scannability: {
      score: Math.round(scannabilityScore),
      issues,
      recommendations,
    },
    contrast: {
      ratio: Math.round(contrastRatio * 10) / 10,
      score: Math.round(contrastScore),
      passed: contrastPassed,
    },
    size: {
      recommendedDistance: getRecommendedScanDistance(size),
      moduleSize: Math.round(moduleSize * 10) / 10,
      score: sizeScore,
    },
    logo: {
      percentageOfQR: Math.round(logoPercentage),
      score: logoScore,
      warning: logoWarning,
    },
    errorCorrection: {
      level: errorLevel,
      capacity: errorCorrectionCapacity,
      recommendation: errorCorrectionRec,
    },
  };
}

// Get quality rating text
export function getQualityRating(score: number): {
  rating: string;
  color: string;
  description: string;
} {
  if (score >= 90) {
    return {
      rating: 'Excellent',
      color: 'text-green-600 dark:text-green-400',
      description: 'This QR code should scan reliably in most conditions',
    };
  } else if (score >= 75) {
    return {
      rating: 'Good',
      color: 'text-blue-600 dark:text-blue-400',
      description: 'This QR code should work well for most use cases',
    };
  } else if (score >= 60) {
    return {
      rating: 'Fair',
      color: 'text-yellow-600 dark:text-yellow-400',
      description: 'This QR code may have some scanning issues',
    };
  } else {
    return {
      rating: 'Poor',
      color: 'text-red-600 dark:text-red-400',
      description: 'This QR code may be difficult to scan reliably',
    };
  }
}

// ============================================
// Enhanced Validation System
// ============================================

export interface EnhancedValidationResult {
  isValid: boolean;
  score: number;
  category: 'excellent' | 'good' | 'fair' | 'poor';
  checks: ValidationCheck[];
  summary: {
    passed: number;
    warnings: number;
    errors: number;
  };
  printRecommendation: PrintRecommendation;
}

export interface ValidationCheck {
  id: string;
  name: string;
  category: 'contrast' | 'size' | 'content' | 'logo' | 'accessibility' | 'technical';
  status: 'pass' | 'warning' | 'error';
  message: string;
  details?: string;
  suggestion?: string;
  score: number;
}

export interface PrintRecommendation {
  minSizeCm: number;
  minSizeInches: number;
  recommendedSizeCm: number;
  recommendedSizeInches: number;
  scanDistanceM: number;
  scanDistanceFt: number;
  dpi: number;
}

export interface QRCodeConfig {
  content: string;
  type: string;
  size: number;
  errorCorrection: ErrorCorrectionLevel;
  foregroundColor: string;
  backgroundColor: string;
  dotStyle?: string;
  margin?: number;
  hasLogo?: boolean;
  logoSize?: number;
  gradient?: {
    enabled: boolean;
    colors?: string[];
  };
}

// QR code version capacities
const VERSION_CAPACITIES = [
  17, 32, 53, 78, 106, 134, 154, 192, 230, 271,
  321, 367, 425, 458, 520, 586, 644, 718, 792, 858,
  929, 1003, 1091, 1171, 1273, 1367, 1465, 1528, 1628, 1732
];

function estimateVersion(contentLength: number): number {
  for (let v = 0; v < VERSION_CAPACITIES.length; v++) {
    if (contentLength <= VERSION_CAPACITIES[v]) {
      return v + 1;
    }
  }
  return 40;
}

function getModuleCount(version: number): number {
  return 21 + (version - 1) * 4;
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

function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex);
  if (!rgb) return false;
  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness > 180;
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Comprehensive QR code validation
 */
export function enhancedValidate(config: QRCodeConfig): EnhancedValidationResult {
  const checks: ValidationCheck[] = [];

  // 1. Content Validation
  if (!config.content || config.content.trim().length === 0) {
    checks.push({
      id: 'content-empty',
      name: 'Content Present',
      category: 'content',
      status: 'error',
      message: 'QR code has no content',
      suggestion: 'Add content for the QR code to encode',
      score: 0,
    });
  } else {
    checks.push({
      id: 'content-present',
      name: 'Content Present',
      category: 'content',
      status: 'pass',
      message: 'Content is present',
      details: `${config.content.length} characters`,
      score: 100,
    });

    // Content length check
    if (config.content.length > 1000) {
      checks.push({
        id: 'content-length',
        name: 'Content Length',
        category: 'content',
        status: 'warning',
        message: 'Content is very long',
        details: 'Long content creates dense QR codes that are harder to scan',
        suggestion: 'Consider using a URL shortener or reducing content',
        score: 60,
      });
    } else if (config.content.length > 500) {
      checks.push({
        id: 'content-length',
        name: 'Content Length',
        category: 'content',
        status: 'warning',
        message: 'Content is moderately long',
        suggestion: 'Consider if all content is necessary',
        score: 80,
      });
    } else {
      checks.push({
        id: 'content-length',
        name: 'Content Length',
        category: 'content',
        status: 'pass',
        message: 'Content length is optimal',
        score: 100,
      });
    }

    // URL validation
    if (config.type === 'url' || config.content.startsWith('http')) {
      if (!isValidUrl(config.content)) {
        checks.push({
          id: 'url-valid',
          name: 'URL Format',
          category: 'content',
          status: 'error',
          message: 'Invalid URL format',
          suggestion: 'Ensure URL includes https:// and is properly formatted',
          score: 0,
        });
      } else {
        if (config.content.startsWith('http://')) {
          checks.push({
            id: 'url-secure',
            name: 'URL Security',
            category: 'content',
            status: 'warning',
            message: 'Using insecure HTTP',
            suggestion: 'Use HTTPS for secure connections',
            score: 70,
          });
        } else {
          checks.push({
            id: 'url-secure',
            name: 'URL Security',
            category: 'content',
            status: 'pass',
            message: 'Using secure HTTPS',
            score: 100,
          });
        }
      }
    }
  }

  // 2. Contrast Validation
  const contrastRatio = getContrastRatio(config.foregroundColor, config.backgroundColor);

  if (contrastRatio < 2) {
    checks.push({
      id: 'contrast',
      name: 'Color Contrast',
      category: 'contrast',
      status: 'error',
      message: 'Contrast is too low to scan',
      details: `Ratio: ${contrastRatio.toFixed(1)}:1 (minimum 3:1 required)`,
      suggestion: 'Use darker foreground or lighter background',
      score: 0,
    });
  } else if (contrastRatio < 3) {
    checks.push({
      id: 'contrast',
      name: 'Color Contrast',
      category: 'contrast',
      status: 'error',
      message: 'Contrast may cause scanning issues',
      details: `Ratio: ${contrastRatio.toFixed(1)}:1`,
      suggestion: 'Increase contrast for reliable scanning',
      score: 30,
    });
  } else if (contrastRatio < 4.5) {
    checks.push({
      id: 'contrast',
      name: 'Color Contrast',
      category: 'contrast',
      status: 'warning',
      message: 'Contrast could be improved',
      details: `Ratio: ${contrastRatio.toFixed(1)}:1 (4.5:1 recommended)`,
      suggestion: 'Higher contrast improves scanning reliability',
      score: 70,
    });
  } else {
    checks.push({
      id: 'contrast',
      name: 'Color Contrast',
      category: 'contrast',
      status: 'pass',
      message: 'Excellent contrast',
      details: `Ratio: ${contrastRatio.toFixed(1)}:1`,
      score: 100,
    });
  }

  // 3. Color scheme validation
  if (isLightColor(config.foregroundColor)) {
    checks.push({
      id: 'foreground-color',
      name: 'Foreground Color',
      category: 'accessibility',
      status: 'warning',
      message: 'Light foreground color',
      details: 'Inverted QR codes may not scan on all devices',
      suggestion: 'Use a dark foreground color for best compatibility',
      score: 60,
    });
  } else {
    checks.push({
      id: 'foreground-color',
      name: 'Foreground Color',
      category: 'accessibility',
      status: 'pass',
      message: 'Standard dark foreground',
      score: 100,
    });
  }

  // 4. Size validation
  if (config.size < 100) {
    checks.push({
      id: 'size',
      name: 'QR Code Size',
      category: 'size',
      status: 'error',
      message: 'QR code is too small',
      details: `${config.size}px is below minimum recommended size`,
      suggestion: 'Use at least 100px for digital, larger for print',
      score: 30,
    });
  } else if (config.size < 200) {
    checks.push({
      id: 'size',
      name: 'QR Code Size',
      category: 'size',
      status: 'warning',
      message: 'QR code is small',
      details: `${config.size}px - may be hard to scan from distance`,
      suggestion: 'Consider 200px+ for better scan distance',
      score: 70,
    });
  } else {
    checks.push({
      id: 'size',
      name: 'QR Code Size',
      category: 'size',
      status: 'pass',
      message: 'Good QR code size',
      details: `${config.size}px`,
      score: 100,
    });
  }

  // 5. Margin/Quiet zone validation
  if (config.margin !== undefined) {
    if (config.margin < 2) {
      checks.push({
        id: 'margin',
        name: 'Quiet Zone',
        category: 'technical',
        status: 'warning',
        message: 'Small quiet zone',
        details: 'The white border helps scanners detect the QR code',
        suggestion: 'Use a margin of at least 4 modules',
        score: 60,
      });
    } else {
      checks.push({
        id: 'margin',
        name: 'Quiet Zone',
        category: 'technical',
        status: 'pass',
        message: 'Adequate quiet zone',
        score: 100,
      });
    }
  }

  // 6. Logo validation
  if (config.hasLogo && config.logoSize !== undefined) {
    const logoPercentage = config.logoSize * 100;

    if (logoPercentage > 30) {
      checks.push({
        id: 'logo-size',
        name: 'Logo Size',
        category: 'logo',
        status: 'error',
        message: 'Logo is too large',
        details: `Logo covers ${logoPercentage.toFixed(0)}% (max 30%)`,
        suggestion: 'Reduce logo size or remove it',
        score: 20,
      });
    } else if (logoPercentage > 20) {
      checks.push({
        id: 'logo-size',
        name: 'Logo Size',
        category: 'logo',
        status: 'warning',
        message: 'Logo is large',
        details: `Logo covers ${logoPercentage.toFixed(0)}%`,
        suggestion: 'Use High (H) error correction with large logos',
        score: 70,
      });
    } else {
      checks.push({
        id: 'logo-size',
        name: 'Logo Size',
        category: 'logo',
        status: 'pass',
        message: 'Logo size is appropriate',
        details: `Logo covers ${logoPercentage.toFixed(0)}%`,
        score: 100,
      });
    }

    // Error correction with logo
    if (config.errorCorrection === 'L' || config.errorCorrection === 'M') {
      checks.push({
        id: 'logo-ec',
        name: 'Error Correction',
        category: 'logo',
        status: 'warning',
        message: 'Low error correction with logo',
        suggestion: 'Use Q or H error correction when using logos',
        score: 60,
      });
    }
  }

  // 7. Error correction recommendation
  const version = estimateVersion(config.content.length);
  if (version > 10 && (config.errorCorrection === 'L')) {
    checks.push({
      id: 'ec-recommendation',
      name: 'Error Correction Level',
      category: 'technical',
      status: 'warning',
      message: 'Consider higher error correction',
      details: `Version ${version} QR code with low error correction`,
      suggestion: 'Use M or Q for better reliability with dense codes',
      score: 70,
    });
  }

  // Calculate summary
  const passed = checks.filter(c => c.status === 'pass').length;
  const warnings = checks.filter(c => c.status === 'warning').length;
  const errors = checks.filter(c => c.status === 'error').length;

  // Calculate overall score
  const totalScore = checks.reduce((sum, c) => sum + c.score, 0);
  const score = Math.round(totalScore / checks.length);

  // Determine category
  let category: 'excellent' | 'good' | 'fair' | 'poor';
  if (errors > 0) {
    category = score >= 50 ? 'fair' : 'poor';
  } else if (warnings > 2) {
    category = 'fair';
  } else if (warnings > 0) {
    category = 'good';
  } else {
    category = 'excellent';
  }

  // Calculate print recommendations
  const moduleCount = getModuleCount(version);
  const minSizeCm = Math.max(2, moduleCount * 0.05);
  const recommendedSizeCm = minSizeCm * 1.5;

  const printRecommendation: PrintRecommendation = {
    minSizeCm: Math.round(minSizeCm * 10) / 10,
    minSizeInches: Math.round(minSizeCm / 2.54 * 10) / 10,
    recommendedSizeCm: Math.round(recommendedSizeCm * 10) / 10,
    recommendedSizeInches: Math.round(recommendedSizeCm / 2.54 * 10) / 10,
    scanDistanceM: Math.round(recommendedSizeCm * 10) / 100,
    scanDistanceFt: Math.round(recommendedSizeCm * 10 / 30.48 * 10) / 10,
    dpi: 300,
  };

  return {
    isValid: errors === 0,
    score,
    category,
    checks,
    summary: { passed, warnings, errors },
    printRecommendation,
  };
}

/**
 * Real-time quick validation for live feedback
 */
export function quickCheck(config: QRCodeConfig): {
  isValid: boolean;
  hasIssues: boolean;
  mainIssue?: string;
  score: number;
} {
  const result = enhancedValidate(config);
  const errorCheck = result.checks.find(c => c.status === 'error');

  return {
    isValid: result.isValid,
    hasIssues: result.summary.errors > 0 || result.summary.warnings > 0,
    mainIssue: errorCheck?.message,
    score: result.score,
  };
}
