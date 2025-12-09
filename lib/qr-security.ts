/**
 * QR Code Security Features
 * Password protection and geolocation restrictions
 */

export interface PasswordProtection {
  qrId: string;
  enabled: boolean;
  passwordHash: string;
  hint?: string;
  maxAttempts?: number;
  currentAttempts: number;
  lockoutUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeolocationRestriction {
  qrId: string;
  enabled: boolean;
  allowedLocations: GeoLocation[];
  radiusMeters: number;
  outsideMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GeoLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radiusOverride?: number;
}

const PASSWORD_KEY = 'qr-password-protection';
const GEOLOCATION_KEY = 'qr-geolocation-restriction';

// ============================================
// Password Protection
// ============================================

/**
 * Simple hash function (for demo purposes - use proper hashing in production)
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

/**
 * Get all password configs
 */
function getAllPasswordConfigs(): Record<string, PasswordProtection> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(PASSWORD_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save all password configs
 */
function savePasswordConfigs(configs: Record<string, PasswordProtection>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PASSWORD_KEY, JSON.stringify(configs));
}

/**
 * Set password protection
 */
export function setPasswordProtection(
  qrId: string,
  password: string,
  options?: {
    hint?: string;
    maxAttempts?: number;
  }
): PasswordProtection {
  const configs = getAllPasswordConfigs();

  const config: PasswordProtection = {
    qrId,
    enabled: true,
    passwordHash: simpleHash(password),
    hint: options?.hint,
    maxAttempts: options?.maxAttempts,
    currentAttempts: 0,
    createdAt: configs[qrId]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  configs[qrId] = config;
  savePasswordConfigs(configs);

  return config;
}

/**
 * Get password protection config
 */
export function getPasswordProtection(qrId: string): PasswordProtection | null {
  const configs = getAllPasswordConfigs();
  return configs[qrId] || null;
}

/**
 * Verify password
 */
export function verifyPassword(qrId: string, password: string): {
  success: boolean;
  locked?: boolean;
  attemptsRemaining?: number;
  message?: string;
} {
  const configs = getAllPasswordConfigs();
  const config = configs[qrId];

  if (!config || !config.enabled) {
    return { success: true };
  }

  // Check lockout
  if (config.lockoutUntil) {
    const lockoutEnd = new Date(config.lockoutUntil);
    if (new Date() < lockoutEnd) {
      const remaining = Math.ceil((lockoutEnd.getTime() - Date.now()) / 60000);
      return {
        success: false,
        locked: true,
        message: `Too many attempts. Try again in ${remaining} minutes.`,
      };
    } else {
      // Lockout expired, reset attempts
      config.currentAttempts = 0;
      config.lockoutUntil = undefined;
    }
  }

  // Verify password
  const isCorrect = simpleHash(password) === config.passwordHash;

  if (isCorrect) {
    config.currentAttempts = 0;
    savePasswordConfigs(configs);
    return { success: true };
  }

  // Wrong password
  config.currentAttempts++;

  if (config.maxAttempts && config.currentAttempts >= config.maxAttempts) {
    // Lock out for 15 minutes
    const lockout = new Date();
    lockout.setMinutes(lockout.getMinutes() + 15);
    config.lockoutUntil = lockout.toISOString();
  }

  savePasswordConfigs(configs);

  return {
    success: false,
    attemptsRemaining: config.maxAttempts
      ? Math.max(0, config.maxAttempts - config.currentAttempts)
      : undefined,
    message: config.hint ? `Hint: ${config.hint}` : 'Incorrect password',
  };
}

/**
 * Remove password protection
 */
export function removePasswordProtection(qrId: string): void {
  const configs = getAllPasswordConfigs();
  delete configs[qrId];
  savePasswordConfigs(configs);
}

/**
 * Change password
 */
export function changePassword(qrId: string, newPassword: string): boolean {
  const configs = getAllPasswordConfigs();
  if (!configs[qrId]) return false;

  configs[qrId].passwordHash = simpleHash(newPassword);
  configs[qrId].currentAttempts = 0;
  configs[qrId].lockoutUntil = undefined;
  configs[qrId].updatedAt = new Date().toISOString();

  savePasswordConfigs(configs);
  return true;
}

/**
 * Check if QR code is password protected
 */
export function isPasswordProtected(qrId: string): boolean {
  const config = getPasswordProtection(qrId);
  return config?.enabled === true;
}

// ============================================
// Geolocation Restrictions
// ============================================

/**
 * Get all geolocation configs
 */
function getAllGeoConfigs(): Record<string, GeolocationRestriction> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(GEOLOCATION_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save all geolocation configs
 */
function saveGeoConfigs(configs: Record<string, GeolocationRestriction>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(GEOLOCATION_KEY, JSON.stringify(configs));
}

/**
 * Calculate distance between two points (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) *
    Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Set geolocation restriction
 */
export function setGeolocationRestriction(
  qrId: string,
  locations: GeoLocation[],
  options?: {
    radiusMeters?: number;
    outsideMessage?: string;
  }
): GeolocationRestriction {
  const configs = getAllGeoConfigs();

  const config: GeolocationRestriction = {
    qrId,
    enabled: true,
    allowedLocations: locations,
    radiusMeters: options?.radiusMeters || 100,
    outsideMessage: options?.outsideMessage,
    createdAt: configs[qrId]?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  configs[qrId] = config;
  saveGeoConfigs(configs);

  return config;
}

/**
 * Get geolocation restriction config
 */
export function getGeolocationRestriction(qrId: string): GeolocationRestriction | null {
  const configs = getAllGeoConfigs();
  return configs[qrId] || null;
}

/**
 * Verify location
 */
export function verifyLocation(
  qrId: string,
  userLat: number,
  userLon: number
): {
  allowed: boolean;
  nearestLocation?: GeoLocation;
  distanceMeters?: number;
  message?: string;
} {
  const config = getGeolocationRestriction(qrId);

  if (!config || !config.enabled) {
    return { allowed: true };
  }

  if (config.allowedLocations.length === 0) {
    return { allowed: true };
  }

  // Find nearest allowed location
  let nearest: GeoLocation | undefined;
  let minDistance = Infinity;

  for (const location of config.allowedLocations) {
    const distance = calculateDistance(
      userLat,
      userLon,
      location.latitude,
      location.longitude
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  }

  const allowedRadius = nearest?.radiusOverride || config.radiusMeters;
  const allowed = minDistance <= allowedRadius;

  return {
    allowed,
    nearestLocation: nearest,
    distanceMeters: Math.round(minDistance),
    message: allowed
      ? undefined
      : config.outsideMessage || `You must be within ${allowedRadius}m of an allowed location`,
  };
}

/**
 * Remove geolocation restriction
 */
export function removeGeolocationRestriction(qrId: string): void {
  const configs = getAllGeoConfigs();
  delete configs[qrId];
  saveGeoConfigs(configs);
}

/**
 * Add location to restriction
 */
export function addAllowedLocation(qrId: string, location: Omit<GeoLocation, 'id'>): GeoLocation | null {
  const configs = getAllGeoConfigs();
  if (!configs[qrId]) return null;

  const newLocation: GeoLocation = {
    ...location,
    id: `loc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  };

  configs[qrId].allowedLocations.push(newLocation);
  configs[qrId].updatedAt = new Date().toISOString();
  saveGeoConfigs(configs);

  return newLocation;
}

/**
 * Remove location from restriction
 */
export function removeAllowedLocation(qrId: string, locationId: string): void {
  const configs = getAllGeoConfigs();
  if (!configs[qrId]) return;

  configs[qrId].allowedLocations = configs[qrId].allowedLocations.filter(
    l => l.id !== locationId
  );
  configs[qrId].updatedAt = new Date().toISOString();
  saveGeoConfigs(configs);
}

/**
 * Check if QR code has geolocation restriction
 */
export function hasGeolocationRestriction(qrId: string): boolean {
  const config = getGeolocationRestriction(qrId);
  return config?.enabled === true;
}

/**
 * Get current location (wrapper for browser API)
 */
export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}
