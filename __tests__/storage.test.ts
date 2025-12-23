/**
 * Tests for storage utilities
 */

import {
  isStorageAvailable,
  getStorageUsage,
  getStorageUsagePercent,
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  formatBytes,
  getStorageStats,
} from '../lib/storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Storage Utilities', () => {
  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
  });

  describe('isStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });
  });

  describe('formatBytes', () => {
    it('should format 0 bytes', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
    });

    it('should format bytes correctly', () => {
      expect(formatBytes(500)).toBe('500 Bytes');
    });

    it('should format kilobytes correctly', () => {
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1572864)).toBe('1.5 MB');
    });
  });

  describe('safeGetItem', () => {
    it('should return parsed JSON for valid stored data', () => {
      const testData = { name: 'test', value: 123 };
      localStorageMock.setItem('test-key', JSON.stringify(testData));

      const result = safeGetItem('test-key', {});
      expect(result).toEqual(testData);
    });

    it('should return default value for missing keys', () => {
      const defaultValue = { default: true };
      const result = safeGetItem('non-existent-key', defaultValue);
      expect(result).toEqual(defaultValue);
    });

    it('should return default value for invalid JSON', () => {
      localStorageMock.setItem('bad-json', 'not valid json');
      const defaultValue = { default: true };

      const result = safeGetItem('bad-json', defaultValue);
      expect(result).toEqual(defaultValue);
    });
  });

  describe('safeSetItem', () => {
    it('should store data as JSON', () => {
      const testData = { name: 'test', value: 123 };
      const result = safeSetItem('test-key', testData);

      expect(result).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'test-key',
        JSON.stringify(testData)
      );
    });

    it('should return true on success', () => {
      const result = safeSetItem('key', 'value');
      expect(result).toBe(true);
    });
  });

  describe('safeRemoveItem', () => {
    it('should remove item from storage', () => {
      localStorageMock.setItem('to-remove', 'value');
      const result = safeRemoveItem('to-remove');

      expect(result).toBe(true);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('to-remove');
    });
  });

  describe('getStorageUsage', () => {
    it('should calculate total storage usage', () => {
      localStorageMock.setItem('key1', 'value1');
      localStorageMock.setItem('key2', 'value2');

      const usage = getStorageUsage();
      expect(usage).toBeGreaterThan(0);
    });
  });

  describe('getStorageUsagePercent', () => {
    it('should return percentage of storage used', () => {
      const percent = getStorageUsagePercent();
      expect(typeof percent).toBe('number');
      expect(percent).toBeGreaterThanOrEqual(0);
      expect(percent).toBeLessThanOrEqual(100);
    });
  });

  describe('getStorageStats', () => {
    it('should return comprehensive stats', () => {
      localStorageMock.setItem('test-key', 'test-value');

      const stats = getStorageStats();

      expect(stats).toHaveProperty('used');
      expect(stats).toHaveProperty('usedFormatted');
      expect(stats).toHaveProperty('percent');
      expect(stats).toHaveProperty('isNearCapacity');
      expect(stats).toHaveProperty('isAvailable');
      expect(stats).toHaveProperty('breakdown');
      expect(Array.isArray(stats.breakdown)).toBe(true);
    });
  });
});

describe('Edge Cases', () => {
  it('should handle circular references gracefully', () => {
    // safeSetItem should handle this
    const circular: Record<string, unknown> = { name: 'test' };
    circular.self = circular;

    // JSON.stringify will throw, safeSetItem should handle it
    const result = safeSetItem('circular', circular);
    expect(result).toBe(false);
  });

  it('should handle undefined values', () => {
    const result = safeSetItem('undefined-test', undefined);
    // undefined serializes to undefined in JSON, which is invalid
    expect(typeof result).toBe('boolean');
  });

  it('should handle null values', () => {
    const result = safeSetItem('null-test', null);
    expect(result).toBe(true);

    const retrieved = safeGetItem('null-test', 'default');
    expect(retrieved).toBeNull();
  });

  it('should handle arrays', () => {
    const testArray = [1, 2, 3, 'four', { five: 5 }];
    safeSetItem('array-test', testArray);

    const retrieved = safeGetItem('array-test', []);
    expect(retrieved).toEqual(testArray);
  });
});
