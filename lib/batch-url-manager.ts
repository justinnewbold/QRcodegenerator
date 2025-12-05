/**
 * Batch URL Manager
 * Bulk update, find, and replace URLs across saved QR codes
 */

export interface URLMatch {
  qrId: string;
  qrName: string;
  qrType: string;
  originalUrl: string;
  field: string;
  createdAt: string;
}

export interface URLReplacement {
  oldUrl: string;
  newUrl: string;
  matchCount: number;
  matches: URLMatch[];
}

export interface BulkUpdateResult {
  totalUpdated: number;
  totalFailed: number;
  updates: {
    qrId: string;
    success: boolean;
    error?: string;
  }[];
}

/**
 * Find all QR codes containing a specific URL pattern
 */
export function findQRsByUrl(pattern: string, exact: boolean = false): URLMatch[] {
  if (typeof window === 'undefined') return [];

  try {
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    const matches: URLMatch[] = [];

    history.forEach((item: {
      id: string;
      name?: string;
      type: string;
      content: string;
      createdAt: string;
      data?: Record<string, string>;
    }) => {
      // Check main content field
      if (matchesPattern(item.content, pattern, exact)) {
        matches.push({
          qrId: item.id,
          qrName: item.name || `${item.type} QR`,
          qrType: item.type,
          originalUrl: item.content,
          field: 'content',
          createdAt: item.createdAt,
        });
      }

      // Check data fields for URL-type content
      if (item.data) {
        Object.entries(item.data).forEach(([field, value]) => {
          if (typeof value === 'string' && matchesPattern(value, pattern, exact)) {
            matches.push({
              qrId: item.id,
              qrName: item.name || `${item.type} QR`,
              qrType: item.type,
              originalUrl: value,
              field,
              createdAt: item.createdAt,
            });
          }
        });
      }
    });

    return matches;
  } catch {
    return [];
  }
}

/**
 * Check if a string matches the pattern
 */
function matchesPattern(str: string, pattern: string, exact: boolean): boolean {
  if (exact) {
    return str === pattern;
  }
  return str.toLowerCase().includes(pattern.toLowerCase());
}

/**
 * Get all unique URLs from saved QR codes
 */
export function getAllUrls(): { url: string; count: number; qrIds: string[] }[] {
  if (typeof window === 'undefined') return [];

  try {
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    const urlMap = new Map<string, { count: number; qrIds: string[] }>();

    history.forEach((item: {
      id: string;
      type: string;
      content: string;
      data?: Record<string, string>;
    }) => {
      // Extract URLs from content
      const urls = extractUrls(item.content);
      urls.forEach(url => {
        const existing = urlMap.get(url) || { count: 0, qrIds: [] };
        existing.count++;
        existing.qrIds.push(item.id);
        urlMap.set(url, existing);
      });

      // Extract URLs from data fields
      if (item.data) {
        Object.values(item.data).forEach(value => {
          if (typeof value === 'string') {
            const dataUrls = extractUrls(value);
            dataUrls.forEach(url => {
              const existing = urlMap.get(url) || { count: 0, qrIds: [] };
              existing.count++;
              if (!existing.qrIds.includes(item.id)) {
                existing.qrIds.push(item.id);
              }
              urlMap.set(url, existing);
            });
          }
        });
      }
    });

    return Array.from(urlMap.entries())
      .map(([url, data]) => ({ url, ...data }))
      .sort((a, b) => b.count - a.count);
  } catch {
    return [];
  }
}

/**
 * Extract URLs from text
 */
function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
  const matches = text.match(urlRegex) || [];
  return [...new Set(matches)];
}

/**
 * Preview URL replacement without applying
 */
export function previewUrlReplacement(
  oldUrl: string,
  newUrl: string,
  exact: boolean = false
): URLReplacement {
  const matches = findQRsByUrl(oldUrl, exact);

  return {
    oldUrl,
    newUrl,
    matchCount: matches.length,
    matches,
  };
}

/**
 * Apply URL replacement to all matching QR codes
 */
export function applyUrlReplacement(
  oldUrl: string,
  newUrl: string,
  exact: boolean = false,
  selectedIds?: string[]
): BulkUpdateResult {
  if (typeof window === 'undefined') {
    return { totalUpdated: 0, totalFailed: 0, updates: [] };
  }

  try {
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    const updates: BulkUpdateResult['updates'] = [];
    let totalUpdated = 0;
    let totalFailed = 0;

    const updatedHistory = history.map((item: {
      id: string;
      content: string;
      data?: Record<string, string>;
    }) => {
      // Skip if not in selected IDs (when provided)
      if (selectedIds && !selectedIds.includes(item.id)) {
        return item;
      }

      try {
        let updated = false;

        // Replace in content
        if (matchesPattern(item.content, oldUrl, exact)) {
          item.content = exact
            ? item.content.replace(oldUrl, newUrl)
            : item.content.replace(new RegExp(escapeRegex(oldUrl), 'gi'), newUrl);
          updated = true;
        }

        // Replace in data fields
        if (item.data) {
          Object.keys(item.data).forEach(field => {
            const value = item.data![field];
            if (typeof value === 'string' && matchesPattern(value, oldUrl, exact)) {
              item.data![field] = exact
                ? value.replace(oldUrl, newUrl)
                : value.replace(new RegExp(escapeRegex(oldUrl), 'gi'), newUrl);
              updated = true;
            }
          });
        }

        if (updated) {
          totalUpdated++;
          updates.push({ qrId: item.id, success: true });
        }

        return item;
      } catch (error) {
        totalFailed++;
        updates.push({
          qrId: item.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return item;
      }
    });

    // Save updated history
    localStorage.setItem('qr-history', JSON.stringify(updatedHistory));

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('qr-history-updated'));

    return { totalUpdated, totalFailed, updates };
  } catch {
    return { totalUpdated: 0, totalFailed: 0, updates: [] };
  }
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Find and replace domain across all QR codes
 */
export function replaceDomain(
  oldDomain: string,
  newDomain: string
): BulkUpdateResult {
  // Normalize domains (remove protocol and trailing slash)
  const normalizedOld = oldDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  const normalizedNew = newDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');

  if (typeof window === 'undefined') {
    return { totalUpdated: 0, totalFailed: 0, updates: [] };
  }

  try {
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    const updates: BulkUpdateResult['updates'] = [];
    let totalUpdated = 0;
    let totalFailed = 0;

    const domainRegex = new RegExp(
      `(https?://)(${escapeRegex(normalizedOld)})(/|$|\\?|#)`,
      'gi'
    );

    const updatedHistory = history.map((item: {
      id: string;
      content: string;
      data?: Record<string, string>;
    }) => {
      try {
        let updated = false;

        // Replace in content
        if (domainRegex.test(item.content)) {
          item.content = item.content.replace(domainRegex, `$1${normalizedNew}$3`);
          updated = true;
          domainRegex.lastIndex = 0; // Reset regex
        }

        // Replace in data fields
        if (item.data) {
          Object.keys(item.data).forEach(field => {
            const value = item.data![field];
            if (typeof value === 'string' && domainRegex.test(value)) {
              item.data![field] = value.replace(domainRegex, `$1${normalizedNew}$3`);
              updated = true;
              domainRegex.lastIndex = 0;
            }
          });
        }

        if (updated) {
          totalUpdated++;
          updates.push({ qrId: item.id, success: true });
        }

        return item;
      } catch (error) {
        totalFailed++;
        updates.push({
          qrId: item.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return item;
      }
    });

    localStorage.setItem('qr-history', JSON.stringify(updatedHistory));
    window.dispatchEvent(new CustomEvent('qr-history-updated'));

    return { totalUpdated, totalFailed, updates };
  } catch {
    return { totalUpdated: 0, totalFailed: 0, updates: [] };
  }
}

/**
 * Get URL statistics
 */
export function getUrlStats(): {
  totalUrls: number;
  uniqueUrls: number;
  topDomains: { domain: string; count: number }[];
  brokenUrls: string[]; // Placeholder for future validation
} {
  const allUrls = getAllUrls();

  const domainMap = new Map<string, number>();
  allUrls.forEach(({ url, count }) => {
    try {
      const domain = new URL(url).hostname;
      domainMap.set(domain, (domainMap.get(domain) || 0) + count);
    } catch {
      // Invalid URL
    }
  });

  const topDomains = Array.from(domainMap.entries())
    .map(([domain, count]) => ({ domain, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return {
    totalUrls: allUrls.reduce((sum, u) => sum + u.count, 0),
    uniqueUrls: allUrls.length,
    topDomains,
    brokenUrls: [], // Would need fetch API to validate
  };
}

/**
 * Export URL report
 */
export function exportUrlReport(): string {
  const allUrls = getAllUrls();
  const stats = getUrlStats();

  const report = {
    generatedAt: new Date().toISOString(),
    statistics: stats,
    urls: allUrls,
  };

  return JSON.stringify(report, null, 2);
}
