/**
 * Expiring QR Codes System
 * QR codes that expire after a date or scan limit
 */

export interface ExpiringQRConfig {
  qrId: string;
  enabled: boolean;
  expiresAt?: string; // ISO date
  maxScans?: number;
  currentScans: number;
  expiredRedirectUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpirationStatus {
  isExpired: boolean;
  reason?: 'date' | 'scans' | 'manual';
  expiresAt?: string;
  scansRemaining?: number;
  percentUsed?: number;
}

const STORAGE_KEY = 'qr-expiring-config';

/**
 * Get all expiring configs
 */
function getAllConfigs(): Record<string, ExpiringQRConfig> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save all configs
 */
function saveAllConfigs(configs: Record<string, ExpiringQRConfig>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

/**
 * Set expiration for a QR code
 */
export function setExpiration(
  qrId: string,
  options: {
    expiresAt?: Date | string;
    maxScans?: number;
    expiredRedirectUrl?: string;
  }
): ExpiringQRConfig {
  const configs = getAllConfigs();

  const config: ExpiringQRConfig = {
    qrId,
    enabled: true,
    expiresAt: options.expiresAt
      ? typeof options.expiresAt === 'string'
        ? options.expiresAt
        : options.expiresAt.toISOString()
      : undefined,
    maxScans: options.maxScans,
    currentScans: configs[qrId]?.currentScans || 0,
    expiredRedirectUrl: options.expiredRedirectUrl,
    createdAt: configs[qrId]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  configs[qrId] = config;
  saveAllConfigs(configs);

  return config;
}

/**
 * Get expiration config for a QR code
 */
export function getExpirationConfig(qrId: string): ExpiringQRConfig | null {
  const configs = getAllConfigs();
  return configs[qrId] || null;
}

/**
 * Check expiration status
 */
export function checkExpirationStatus(qrId: string): ExpirationStatus {
  const config = getExpirationConfig(qrId);

  if (!config || !config.enabled) {
    return { isExpired: false };
  }

  // Check date expiration
  if (config.expiresAt) {
    const expiryDate = new Date(config.expiresAt);
    if (new Date() > expiryDate) {
      return {
        isExpired: true,
        reason: 'date',
        expiresAt: config.expiresAt,
      };
    }
  }

  // Check scan limit
  if (config.maxScans !== undefined && config.currentScans >= config.maxScans) {
    return {
      isExpired: true,
      reason: 'scans',
      scansRemaining: 0,
      percentUsed: 100,
    };
  }

  // Not expired - return remaining info
  const status: ExpirationStatus = { isExpired: false };

  if (config.expiresAt) {
    status.expiresAt = config.expiresAt;
  }

  if (config.maxScans !== undefined) {
    status.scansRemaining = config.maxScans - config.currentScans;
    status.percentUsed = Math.round((config.currentScans / config.maxScans) * 100);
  }

  return status;
}

/**
 * Record a scan
 */
export function recordScan(qrId: string): ExpirationStatus {
  const configs = getAllConfigs();
  const config = configs[qrId];

  if (config) {
    config.currentScans++;
    config.updatedAt = new Date().toISOString();
    saveAllConfigs(configs);
  }

  return checkExpirationStatus(qrId);
}

/**
 * Remove expiration from QR code
 */
export function removeExpiration(qrId: string): void {
  const configs = getAllConfigs();
  delete configs[qrId];
  saveAllConfigs(configs);
}

/**
 * Disable expiration (keep config but disable)
 */
export function disableExpiration(qrId: string): void {
  const configs = getAllConfigs();
  if (configs[qrId]) {
    configs[qrId].enabled = false;
    configs[qrId].updatedAt = new Date().toISOString();
    saveAllConfigs(configs);
  }
}

/**
 * Enable expiration
 */
export function enableExpiration(qrId: string): void {
  const configs = getAllConfigs();
  if (configs[qrId]) {
    configs[qrId].enabled = true;
    configs[qrId].updatedAt = new Date().toISOString();
    saveAllConfigs(configs);
  }
}

/**
 * Reset scan count
 */
export function resetScanCount(qrId: string): void {
  const configs = getAllConfigs();
  if (configs[qrId]) {
    configs[qrId].currentScans = 0;
    configs[qrId].updatedAt = new Date().toISOString();
    saveAllConfigs(configs);
  }
}

/**
 * Extend expiration date
 */
export function extendExpiration(qrId: string, additionalDays: number): void {
  const configs = getAllConfigs();
  if (configs[qrId] && configs[qrId].expiresAt) {
    const currentExpiry = new Date(configs[qrId].expiresAt!);
    const now = new Date();
    const baseDate = currentExpiry > now ? currentExpiry : now;
    baseDate.setDate(baseDate.getDate() + additionalDays);
    configs[qrId].expiresAt = baseDate.toISOString();
    configs[qrId].updatedAt = new Date().toISOString();
    saveAllConfigs(configs);
  }
}

/**
 * Increase scan limit
 */
export function increaseScanLimit(qrId: string, additionalScans: number): void {
  const configs = getAllConfigs();
  if (configs[qrId] && configs[qrId].maxScans !== undefined) {
    configs[qrId].maxScans! += additionalScans;
    configs[qrId].updatedAt = new Date().toISOString();
    saveAllConfigs(configs);
  }
}

/**
 * Get all expiring QR codes
 */
export function getAllExpiringQRCodes(): ExpiringQRConfig[] {
  const configs = getAllConfigs();
  return Object.values(configs).filter(c => c.enabled);
}

/**
 * Get soon-to-expire QR codes
 */
export function getSoonToExpire(withinDays: number = 7): ExpiringQRConfig[] {
  const configs = getAllConfigs();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + withinDays);

  return Object.values(configs).filter(c => {
    if (!c.enabled) return false;

    // Check date
    if (c.expiresAt) {
      const expiryDate = new Date(c.expiresAt);
      if (expiryDate <= cutoff && expiryDate > new Date()) {
        return true;
      }
    }

    // Check scans (>80% used)
    if (c.maxScans !== undefined) {
      const percentUsed = (c.currentScans / c.maxScans) * 100;
      if (percentUsed >= 80 && percentUsed < 100) {
        return true;
      }
    }

    return false;
  });
}

/**
 * Get expired QR codes
 */
export function getExpiredQRCodes(): ExpiringQRConfig[] {
  const configs = getAllConfigs();

  return Object.values(configs).filter(c => {
    if (!c.enabled) return false;

    const status = checkExpirationStatus(c.qrId);
    return status.isExpired;
  });
}

/**
 * Generate time remaining string
 */
export function getTimeRemaining(expiresAt: string): string {
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();

  if (diff <= 0) return 'Expired';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h remaining`;
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}
