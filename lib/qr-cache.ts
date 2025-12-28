/**
 * QR Code Generation Cache
 * Provides content-based caching to avoid regenerating identical QR codes
 */

export interface CacheEntry {
  dataUrl: string;
  svg?: string;
  timestamp: number;
  hitCount: number;
}

export interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  oldestEntry: number | null;
  newestEntry: number | null;
}

interface CacheOptions {
  maxSize?: number;
  maxAge?: number; // milliseconds
}

/**
 * Generate a hash key from QR code options
 */
export function generateCacheKey(
  content: string,
  options: {
    errorCorrectionLevel?: string;
    size?: number;
    foregroundColor?: string;
    backgroundColor?: string;
    margin?: number;
    style?: string;
    finderPattern?: string;
    logoUrl?: string;
    logoSize?: number;
  }
): string {
  const keyData = {
    content,
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    size: options.size || 300,
    foregroundColor: options.foregroundColor || '#000000',
    backgroundColor: options.backgroundColor || '#FFFFFF',
    margin: options.margin || 4,
    style: options.style || 'squares',
    finderPattern: options.finderPattern || 'square',
    logoUrl: options.logoUrl || '',
    logoSize: options.logoSize || 0.2,
  };

  // Create a deterministic string representation
  const keyString = JSON.stringify(keyData);

  // Simple hash function (djb2)
  let hash = 5381;
  for (let i = 0; i < keyString.length; i++) {
    hash = ((hash << 5) + hash) ^ keyString.charCodeAt(i);
  }

  return `qr_${Math.abs(hash).toString(36)}`;
}

/**
 * QR Code Generation Cache Class
 */
export class QRCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private maxAge: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100;
    this.maxAge = options.maxAge || 5 * 60 * 1000; // 5 minutes default
  }

  /**
   * Get an entry from the cache
   */
  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.misses++;
      return null;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Update hit count
    entry.hitCount++;
    this.hits++;
    return entry;
  }

  /**
   * Set an entry in the cache
   */
  set(key: string, dataUrl: string, svg?: string): void {
    // Evict old entries if at capacity
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      dataUrl,
      svg,
      timestamp: Date.now(),
      hitCount: 0,
    });
  }

  /**
   * Check if an entry exists and is valid
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove an entry from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Evict the oldest entry
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Evict expired entries
   */
  evictExpired(): number {
    const now = Date.now();
    const keysToDelete: string[] = [];

    Array.from(this.cache.entries()).forEach(([key, entry]) => {
      if (now - entry.timestamp > this.maxAge) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
    return keysToDelete.length;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    let oldestEntry: number | null = null;
    let newestEntry: number | null = null;

    Array.from(this.cache.values()).forEach(entry => {
      if (oldestEntry === null || entry.timestamp < oldestEntry) {
        oldestEntry = entry.timestamp;
      }
      if (newestEntry === null || entry.timestamp > newestEntry) {
        newestEntry = entry.timestamp;
      }
    });

    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? (this.hits / totalRequests) * 100 : 0;

    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: Math.round(hitRate * 100) / 100,
      oldestEntry,
      newestEntry,
    };
  }

  /**
   * Get all cached keys
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// Singleton instance
let globalCache: QRCache | null = null;

/**
 * Get the global QR cache instance
 */
export function getQRCache(): QRCache {
  if (!globalCache) {
    globalCache = new QRCache({ maxSize: 100, maxAge: 10 * 60 * 1000 }); // 10 minutes
  }
  return globalCache;
}

/**
 * Reset the global cache (mainly for testing)
 */
export function resetQRCache(): void {
  if (globalCache) {
    globalCache.clear();
  }
  globalCache = null;
}
