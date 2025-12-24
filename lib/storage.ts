/**
 * Safe localStorage utilities with quota handling
 * Provides graceful degradation when storage is full or unavailable
 */

// Storage quota threshold (5MB is typical limit, warn at 4MB)
const QUOTA_WARNING_THRESHOLD = 4 * 1024 * 1024; // 4MB
const STORAGE_ERROR_EVENT = 'storage-error';

/**
 * Storage error types
 */
export type StorageErrorType =
  | 'quota_exceeded'
  | 'storage_unavailable'
  | 'parse_error'
  | 'unknown';

export interface StorageError {
  type: StorageErrorType;
  message: string;
  key?: string;
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get current storage usage in bytes
 */
export function getStorageUsage(): number {
  if (!isStorageAvailable()) return 0;

  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key) || '';
      total += (value.length + key.length) * 2; // UTF-16 encoding
    }
  }
  return total;
}

/**
 * Get storage usage as a percentage (approximate, assumes 5MB limit)
 */
export function getStorageUsagePercent(): number {
  const usage = getStorageUsage();
  const limit = 5 * 1024 * 1024; // 5MB typical limit
  return Math.round((usage / limit) * 100);
}

/**
 * Check if storage is near capacity
 */
export function isStorageNearCapacity(): boolean {
  return getStorageUsage() > QUOTA_WARNING_THRESHOLD;
}

/**
 * Dispatch a storage error event
 */
function dispatchStorageError(error: StorageError): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT, { detail: error }));
  }
}

/**
 * Safely get an item from localStorage
 */
export function safeGetItem<T>(key: string, defaultValue: T): T {
  if (!isStorageAvailable()) {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    dispatchStorageError({
      type: 'parse_error',
      message: `Failed to parse stored data for key: ${key}`,
      key,
    });
    return defaultValue;
  }
}

/**
 * Safely set an item in localStorage with quota handling
 */
export function safeSetItem<T>(key: string, value: T): boolean {
  if (!isStorageAvailable()) {
    dispatchStorageError({
      type: 'storage_unavailable',
      message: 'localStorage is not available',
      key,
    });
    return false;
  }

  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error instanceof DOMException && (
      error.code === 22 || // QUOTA_EXCEEDED_ERR
      error.code === 1014 || // NS_ERROR_DOM_QUOTA_REACHED (Firefox)
      error.name === 'QuotaExceededError' ||
      error.name === 'NS_ERROR_DOM_QUOTA_REACHED'
    )) {
      dispatchStorageError({
        type: 'quota_exceeded',
        message: 'localStorage quota exceeded. Please clear some history or data.',
        key,
      });
      return false;
    }

    dispatchStorageError({
      type: 'unknown',
      message: `Failed to save data: ${error instanceof Error ? error.message : 'Unknown error'}`,
      key,
    });
    return false;
  }
}

/**
 * Safely remove an item from localStorage
 */
export function safeRemoveItem(key: string): boolean {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clear all QR-related data from localStorage
 */
export function clearAllQRData(): void {
  if (!isStorageAvailable()) return;

  const keysToRemove: string[] = [];
  for (const key in localStorage) {
    if (key.startsWith('qr-') || key.startsWith('qr_')) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach(key => localStorage.removeItem(key));
}

/**
 * Get all storage keys with their sizes
 */
export function getStorageBreakdown(): Array<{ key: string; size: number }> {
  if (!isStorageAvailable()) return [];

  const breakdown: Array<{ key: string; size: number }> = [];
  for (const key in localStorage) {
    if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
      breakdown.push({
        key,
        size: (localStorage[key].length + key.length) * 2,
      });
    }
  }

  return breakdown.sort((a, b) => b.size - a.size);
}

/**
 * Try to free up space by removing oldest/least important data
 * Returns bytes freed
 */
export function freeUpSpace(targetBytes: number = 100000): number {
  if (!isStorageAvailable()) return 0;

  let freedBytes = 0;
  const keysToTrim = [
    'qr-generator-history',
    'qr-analytics-events',
    'qr-webhook-logs',
  ];

  for (const key of keysToTrim) {
    if (freedBytes >= targetBytes) break;

    const item = localStorage.getItem(key);
    if (item) {
      try {
        const data = JSON.parse(item);
        if (Array.isArray(data) && data.length > 10) {
          // Keep only last 10 items
          const trimmed = data.slice(-10);
          const originalSize = item.length * 2;
          const newData = JSON.stringify(trimmed);
          localStorage.setItem(key, newData);
          freedBytes += originalSize - (newData.length * 2);
        }
      } catch {
        // If we can't parse it, remove it
        const size = item.length * 2;
        localStorage.removeItem(key);
        freedBytes += size;
      }
    }
  }

  return freedBytes;
}

/**
 * Subscribe to storage error events
 */
export function onStorageError(callback: (error: StorageError) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<StorageError>;
    callback(customEvent.detail);
  };

  window.addEventListener(STORAGE_ERROR_EVENT, handler);
  return () => window.removeEventListener(STORAGE_ERROR_EVENT, handler);
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Storage stats interface
 */
export interface StorageStats {
  used: number;
  usedFormatted: string;
  percent: number;
  isNearCapacity: boolean;
  isAvailable: boolean;
  breakdown: Array<{ key: string; size: number; sizeFormatted: string }>;
}

/**
 * Get comprehensive storage statistics
 */
export function getStorageStats(): StorageStats {
  const used = getStorageUsage();
  const breakdown = getStorageBreakdown().map(item => ({
    ...item,
    sizeFormatted: formatBytes(item.size),
  }));

  return {
    used,
    usedFormatted: formatBytes(used),
    percent: getStorageUsagePercent(),
    isNearCapacity: isStorageNearCapacity(),
    isAvailable: isStorageAvailable(),
    breakdown,
  };
}
