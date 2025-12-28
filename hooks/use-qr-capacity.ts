import { useState, useEffect, useMemo } from 'react';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

interface QRVersionInfo {
  version: number;
  modules: number;
  capacityL: number;
  capacityM: number;
  capacityQ: number;
  capacityH: number;
}

// QR Code version capacities (binary mode bytes)
const QR_VERSIONS: QRVersionInfo[] = [
  { version: 1, modules: 21, capacityL: 17, capacityM: 14, capacityQ: 11, capacityH: 7 },
  { version: 2, modules: 25, capacityL: 32, capacityM: 26, capacityQ: 20, capacityH: 14 },
  { version: 3, modules: 29, capacityL: 53, capacityM: 42, capacityQ: 32, capacityH: 24 },
  { version: 4, modules: 33, capacityL: 78, capacityM: 62, capacityQ: 46, capacityH: 34 },
  { version: 5, modules: 37, capacityL: 106, capacityM: 84, capacityQ: 60, capacityH: 44 },
  { version: 6, modules: 41, capacityL: 134, capacityM: 106, capacityQ: 74, capacityH: 58 },
  { version: 7, modules: 45, capacityL: 154, capacityM: 122, capacityQ: 86, capacityH: 64 },
  { version: 8, modules: 49, capacityL: 192, capacityM: 152, capacityQ: 108, capacityH: 84 },
  { version: 10, modules: 57, capacityL: 271, capacityM: 213, capacityQ: 151, capacityH: 119 },
  { version: 15, modules: 77, capacityL: 520, capacityM: 412, capacityQ: 292, capacityH: 226 },
  { version: 20, modules: 97, capacityL: 858, capacityM: 666, capacityQ: 482, capacityH: 382 },
  { version: 25, modules: 117, capacityL: 1273, capacityM: 998, capacityQ: 718, capacityH: 554 },
  { version: 30, modules: 137, capacityL: 1732, capacityM: 1370, capacityQ: 982, capacityH: 742 },
  { version: 35, modules: 157, capacityL: 2303, capacityM: 1812, capacityQ: 1306, capacityH: 1006 },
  { version: 40, modules: 177, capacityL: 2953, capacityM: 2331, capacityQ: 1663, capacityH: 1273 },
];

export interface QRCapacityInfo {
  contentSize: number;
  maxCapacity: number;
  usagePercent: number;
  fitsInQR: boolean;
  requiredVersion: number;
  requiredModules: number;
  warningLevel: 'ok' | 'warning' | 'danger' | 'overflow';
  recommendation: string | null;
  alternativeLevel: ErrorCorrectionLevel | null;
  alternativeCapacity: number | null;
}

function getCapacityForLevel(version: QRVersionInfo, level: ErrorCorrectionLevel): number {
  switch (level) {
    case 'L': return version.capacityL;
    case 'M': return version.capacityM;
    case 'Q': return version.capacityQ;
    case 'H': return version.capacityH;
  }
}

function findRequiredVersion(contentSize: number, level: ErrorCorrectionLevel): QRVersionInfo | null {
  for (const version of QR_VERSIONS) {
    if (getCapacityForLevel(version, level) >= contentSize) {
      return version;
    }
  }
  return null;
}

function findBetterErrorLevel(contentSize: number, currentLevel: ErrorCorrectionLevel): ErrorCorrectionLevel | null {
  const levels: ErrorCorrectionLevel[] = ['H', 'Q', 'M', 'L'];
  const currentIndex = levels.indexOf(currentLevel);

  // Find the highest error correction level that still fits
  for (let i = 0; i <= currentIndex; i++) {
    const version = findRequiredVersion(contentSize, levels[i]);
    if (version) {
      if (levels[i] !== currentLevel) {
        return levels[i];
      }
      return null;
    }
  }

  return null;
}

export function useQRCapacity(
  content: string,
  errorCorrectionLevel: ErrorCorrectionLevel = 'M'
): QRCapacityInfo {
  const capacityInfo = useMemo(() => {
    // Calculate content size in bytes (UTF-8)
    const contentSize = new Blob([content]).size;

    // Find required version for current error level
    const requiredVersion = findRequiredVersion(contentSize, errorCorrectionLevel);
    const maxCapacity = QR_VERSIONS[QR_VERSIONS.length - 1];
    const maxCapacityForLevel = getCapacityForLevel(maxCapacity, errorCorrectionLevel);

    // Calculate usage percentage
    const usagePercent = requiredVersion
      ? Math.round((contentSize / getCapacityForLevel(requiredVersion, errorCorrectionLevel)) * 100)
      : Math.round((contentSize / maxCapacityForLevel) * 100);

    // Determine warning level
    let warningLevel: 'ok' | 'warning' | 'danger' | 'overflow';
    if (!requiredVersion) {
      warningLevel = 'overflow';
    } else if (usagePercent >= 90) {
      warningLevel = 'danger';
    } else if (usagePercent >= 70) {
      warningLevel = 'warning';
    } else {
      warningLevel = 'ok';
    }

    // Generate recommendation
    let recommendation: string | null = null;
    let alternativeLevel: ErrorCorrectionLevel | null = null;
    let alternativeCapacity: number | null = null;

    if (warningLevel === 'overflow') {
      const betterLevel = findBetterErrorLevel(contentSize, errorCorrectionLevel);
      if (betterLevel) {
        const betterVersion = findRequiredVersion(contentSize, betterLevel);
        if (betterVersion) {
          alternativeLevel = betterLevel;
          alternativeCapacity = getCapacityForLevel(betterVersion, betterLevel);
          recommendation = `Content exceeds capacity. Switch to ${betterLevel} error correction (${Math.round(betterLevel === 'L' ? 7 : betterLevel === 'M' ? 15 : betterLevel === 'Q' ? 25 : 30)}% recovery) to fit ${alternativeCapacity} bytes.`;
        }
      } else {
        recommendation = `Content (${contentSize} bytes) exceeds maximum QR capacity (${maxCapacityForLevel} bytes). Reduce content length.`;
      }
    } else if (warningLevel === 'danger') {
      recommendation = `Content is near capacity limit (${usagePercent}%). Consider reducing content or using lower error correction.`;
    } else if (warningLevel === 'warning' && errorCorrectionLevel !== 'H') {
      const higherLevel = errorCorrectionLevel === 'L' ? 'M' : errorCorrectionLevel === 'M' ? 'Q' : 'H';
      const higherVersion = findRequiredVersion(contentSize, higherLevel);
      if (higherVersion) {
        recommendation = `You could increase error correction to ${higherLevel} for better scan reliability.`;
      }
    }

    return {
      contentSize,
      maxCapacity: maxCapacityForLevel,
      usagePercent: Math.min(usagePercent, 100),
      fitsInQR: !!requiredVersion,
      requiredVersion: requiredVersion?.version ?? 40,
      requiredModules: requiredVersion?.modules ?? 177,
      warningLevel,
      recommendation,
      alternativeLevel,
      alternativeCapacity,
    };
  }, [content, errorCorrectionLevel]);

  return capacityInfo;
}

/**
 * Get capacity info without React hooks (for non-component usage)
 */
export function getQRCapacityInfo(
  content: string,
  errorCorrectionLevel: ErrorCorrectionLevel = 'M'
): QRCapacityInfo {
  const contentSize = new Blob([content]).size;
  const requiredVersion = findRequiredVersion(contentSize, errorCorrectionLevel);
  const maxCapacity = QR_VERSIONS[QR_VERSIONS.length - 1];
  const maxCapacityForLevel = getCapacityForLevel(maxCapacity, errorCorrectionLevel);

  const usagePercent = requiredVersion
    ? Math.round((contentSize / getCapacityForLevel(requiredVersion, errorCorrectionLevel)) * 100)
    : Math.round((contentSize / maxCapacityForLevel) * 100);

  let warningLevel: 'ok' | 'warning' | 'danger' | 'overflow';
  if (!requiredVersion) {
    warningLevel = 'overflow';
  } else if (usagePercent >= 90) {
    warningLevel = 'danger';
  } else if (usagePercent >= 70) {
    warningLevel = 'warning';
  } else {
    warningLevel = 'ok';
  }

  return {
    contentSize,
    maxCapacity: maxCapacityForLevel,
    usagePercent: Math.min(usagePercent, 100),
    fitsInQR: !!requiredVersion,
    requiredVersion: requiredVersion?.version ?? 40,
    requiredModules: requiredVersion?.modules ?? 177,
    warningLevel,
    recommendation: null,
    alternativeLevel: null,
    alternativeCapacity: null,
  };
}
