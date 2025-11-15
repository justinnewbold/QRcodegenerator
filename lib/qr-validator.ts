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
