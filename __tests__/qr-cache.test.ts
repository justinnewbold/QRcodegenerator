import {
  QRCache,
  generateCacheKey,
  getQRCache,
  resetQRCache,
} from '../lib/qr-cache';

describe('QRCache', () => {
  let cache: QRCache;

  beforeEach(() => {
    cache = new QRCache({ maxSize: 5, maxAge: 1000 });
  });

  describe('generateCacheKey', () => {
    it('should generate consistent keys for same inputs', () => {
      const key1 = generateCacheKey('https://example.com', {
        size: 300,
        foregroundColor: '#000000',
      });
      const key2 = generateCacheKey('https://example.com', {
        size: 300,
        foregroundColor: '#000000',
      });
      expect(key1).toBe(key2);
    });

    it('should generate different keys for different content', () => {
      const key1 = generateCacheKey('https://example1.com', { size: 300 });
      const key2 = generateCacheKey('https://example2.com', { size: 300 });
      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different options', () => {
      const key1 = generateCacheKey('https://example.com', { size: 300 });
      const key2 = generateCacheKey('https://example.com', { size: 400 });
      expect(key1).not.toBe(key2);
    });

    it('should include all relevant options in key', () => {
      const key1 = generateCacheKey('test', {
        errorCorrectionLevel: 'H',
        style: 'dots',
      });
      const key2 = generateCacheKey('test', {
        errorCorrectionLevel: 'L',
        style: 'squares',
      });
      expect(key1).not.toBe(key2);
    });
  });

  describe('set and get', () => {
    it('should store and retrieve entries', () => {
      cache.set('key1', 'data:image/png;base64,abc123');
      const entry = cache.get('key1');
      expect(entry).not.toBeNull();
      expect(entry?.dataUrl).toBe('data:image/png;base64,abc123');
    });

    it('should return null for missing entries', () => {
      const entry = cache.get('nonexistent');
      expect(entry).toBeNull();
    });

    it('should store SVG data', () => {
      cache.set('key1', 'data:image/png;base64,abc', '<svg>...</svg>');
      const entry = cache.get('key1');
      expect(entry?.svg).toBe('<svg>...</svg>');
    });

    it('should increment hit count on get', () => {
      cache.set('key1', 'data:image/png;base64,abc');
      cache.get('key1');
      cache.get('key1');
      const entry = cache.get('key1');
      expect(entry?.hitCount).toBe(3);
    });
  });

  describe('has', () => {
    it('should return true for existing entries', () => {
      cache.set('key1', 'data');
      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for missing entries', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });
  });

  describe('delete', () => {
    it('should remove entries', () => {
      cache.set('key1', 'data');
      expect(cache.has('key1')).toBe(true);
      cache.delete('key1');
      expect(cache.has('key1')).toBe(false);
    });

    it('should return true when entry exists', () => {
      cache.set('key1', 'data');
      expect(cache.delete('key1')).toBe(true);
    });

    it('should return false when entry does not exist', () => {
      expect(cache.delete('nonexistent')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all entries', () => {
      cache.set('key1', 'data1');
      cache.set('key2', 'data2');
      cache.clear();
      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key2')).toBe(false);
    });

    it('should reset stats', () => {
      cache.set('key1', 'data');
      cache.get('key1');
      cache.get('nonexistent');
      cache.clear();
      const stats = cache.getStats();
      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
    });
  });

  describe('eviction', () => {
    it('should evict oldest entry when at capacity', () => {
      cache.set('key1', 'data1');
      cache.set('key2', 'data2');
      cache.set('key3', 'data3');
      cache.set('key4', 'data4');
      cache.set('key5', 'data5');
      cache.set('key6', 'data6'); // Should evict key1

      expect(cache.has('key1')).toBe(false);
      expect(cache.has('key6')).toBe(true);
    });

    it('should evict expired entries', async () => {
      cache.set('key1', 'data1');
      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('getStats', () => {
    it('should track hits and misses', () => {
      cache.set('key1', 'data');
      cache.get('key1');
      cache.get('key1');
      cache.get('nonexistent');

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBeCloseTo(66.67, 0);
    });

    it('should report size correctly', () => {
      cache.set('key1', 'data1');
      cache.set('key2', 'data2');
      expect(cache.getStats().size).toBe(2);
    });
  });

  describe('singleton', () => {
    afterEach(() => {
      resetQRCache();
    });

    it('should return same instance', () => {
      const cache1 = getQRCache();
      const cache2 = getQRCache();
      expect(cache1).toBe(cache2);
    });

    it('should reset correctly', () => {
      const cache1 = getQRCache();
      cache1.set('key', 'value');
      resetQRCache();
      const cache2 = getQRCache();
      expect(cache2.has('key')).toBe(false);
    });
  });
});
