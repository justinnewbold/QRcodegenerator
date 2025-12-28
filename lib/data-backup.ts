/**
 * Data Export/Backup System
 * Allows users to export and import all their data
 */

import { getHistory, QRHistoryItem } from './qr-history';
import { getAllPresets, QRPreset } from './preset-manager';
import { getAllThemes, CustomTheme } from './custom-themes';
import { getBrandKits, BrandKit } from './brand-kits';
import { getDynamicQRs, DynamicQR } from './dynamic-qr';
import { getAnalyticsEvents, QRAnalyticsEvent } from './qr-analytics';
import { getFavorites } from './qr-favorites';
import { safeGetItem, safeSetItem } from './storage';

export interface BackupData {
  version: string;
  exportedAt: string;
  data: {
    history: QRHistoryItem[];
    presets: QRPreset[];
    themes: CustomTheme[];
    brandKits: BrandKit[];
    dynamicQRs: DynamicQR[];
    analytics: QRAnalyticsEvent[];
    favorites: string[];
    userPreferences: Record<string, unknown>;
  };
  metadata: {
    totalItems: number;
    historyCount: number;
    presetsCount: number;
    themesCount: number;
    brandKitsCount: number;
    dynamicQRsCount: number;
    analyticsCount: number;
  };
}

export interface ImportResult {
  success: boolean;
  imported: {
    history: number;
    presets: number;
    themes: number;
    brandKits: number;
    dynamicQRs: number;
    analytics: number;
    favorites: number;
  };
  errors: string[];
  warnings: string[];
}

const BACKUP_VERSION = '1.0.0';

/**
 * Export all user data as a backup
 */
export function exportAllData(): BackupData {
  const history = getHistory();
  const presets = getAllPresets().filter(p => !p.isBuiltIn);
  const themes = getAllThemes().filter(t => !t.isBuiltIn);
  const brandKits = getBrandKits();
  const dynamicQRs = getDynamicQRs();
  const analytics = getAnalyticsEvents();
  const favorites = getFavorites().map(f => f.qrId);

  // Get user preferences
  // Note: safeGetItem already returns parsed JSON, so no need to parse again
  const userPreferences: Record<string, unknown> = {};
  const prefKeys = ['user-preferences', 'qr-default-settings', 'accessibility-settings'];
  prefKeys.forEach(key => {
    const value = safeGetItem(key, null);
    if (value !== null) {
      userPreferences[key] = value;
    }
  });

  const backup: BackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      history,
      presets,
      themes,
      brandKits,
      dynamicQRs,
      analytics,
      favorites,
      userPreferences,
    },
    metadata: {
      totalItems: history.length + presets.length + themes.length + brandKits.length + dynamicQRs.length,
      historyCount: history.length,
      presetsCount: presets.length,
      themesCount: themes.length,
      brandKitsCount: brandKits.length,
      dynamicQRsCount: dynamicQRs.length,
      analyticsCount: analytics.length,
    },
  };

  return backup;
}

/**
 * Download backup as a JSON file
 */
export function downloadBackup(): void {
  const backup = exportAllData();
  const json = JSON.stringify(backup, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `qr-generator-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Validate backup data structure
 */
export function validateBackup(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Invalid backup format'] };
  }

  const backup = data as Partial<BackupData>;

  if (!backup.version) {
    errors.push('Missing version field');
  }

  if (!backup.data) {
    errors.push('Missing data field');
  } else {
    if (!Array.isArray(backup.data.history)) {
      errors.push('Invalid or missing history data');
    }
    if (!Array.isArray(backup.data.presets)) {
      errors.push('Invalid or missing presets data');
    }
    if (!Array.isArray(backup.data.themes)) {
      errors.push('Invalid or missing themes data');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Import backup data
 */
export function importBackup(
  backup: BackupData,
  options: {
    mergeHistory?: boolean;
    mergePresets?: boolean;
    mergeThemes?: boolean;
    mergeBrandKits?: boolean;
    mergeDynamicQRs?: boolean;
    importAnalytics?: boolean;
    importPreferences?: boolean;
  } = {}
): ImportResult {
  const {
    mergeHistory = true,
    mergePresets = true,
    mergeThemes = true,
    mergeBrandKits = true,
    mergeDynamicQRs = true,
    importAnalytics = false,
    importPreferences = true,
  } = options;

  const result: ImportResult = {
    success: true,
    imported: {
      history: 0,
      presets: 0,
      themes: 0,
      brandKits: 0,
      dynamicQRs: 0,
      analytics: 0,
      favorites: 0,
    },
    errors: [],
    warnings: [],
  };

  try {
    // Import history
    if (backup.data.history && backup.data.history.length > 0) {
      const existingHistory = getHistory();
      const existingIds = new Set(existingHistory.map(h => h.id));

      let newHistory: QRHistoryItem[];
      if (mergeHistory) {
        const newItems = backup.data.history.filter(h => !existingIds.has(h.id));
        newHistory = [...existingHistory, ...newItems];
        result.imported.history = newItems.length;
      } else {
        newHistory = backup.data.history;
        result.imported.history = backup.data.history.length;
      }

      safeSetItem('qr-history', JSON.stringify(newHistory));
    }

    // Import presets
    if (backup.data.presets && backup.data.presets.length > 0) {
      const existingPresets = getAllPresets().filter(p => !p.isBuiltIn);
      const existingIds = new Set(existingPresets.map(p => p.id));

      let newPresets: QRPreset[];
      if (mergePresets) {
        const newItems = backup.data.presets.filter(p => !existingIds.has(p.id));
        newPresets = [...existingPresets, ...newItems];
        result.imported.presets = newItems.length;
      } else {
        newPresets = backup.data.presets;
        result.imported.presets = backup.data.presets.length;
      }

      safeSetItem('qr-user-presets', JSON.stringify(newPresets));
    }

    // Import themes
    if (backup.data.themes && backup.data.themes.length > 0) {
      const existingThemes = getAllThemes().filter(t => !t.isBuiltIn);
      const existingIds = new Set(existingThemes.map(t => t.id));

      let newThemes: CustomTheme[];
      if (mergeThemes) {
        const newItems = backup.data.themes.filter(t => !existingIds.has(t.id));
        newThemes = [...existingThemes, ...newItems];
        result.imported.themes = newItems.length;
      } else {
        newThemes = backup.data.themes;
        result.imported.themes = backup.data.themes.length;
      }

      safeSetItem('qr-custom-themes', JSON.stringify(newThemes));
    }

    // Import brand kits
    if (backup.data.brandKits && backup.data.brandKits.length > 0) {
      const existingKits = getBrandKits();
      const existingIds = new Set(existingKits.map(k => k.id));

      let newKits: BrandKit[];
      if (mergeBrandKits) {
        const newItems = backup.data.brandKits.filter(k => !existingIds.has(k.id));
        newKits = [...existingKits, ...newItems];
        result.imported.brandKits = newItems.length;
      } else {
        newKits = backup.data.brandKits;
        result.imported.brandKits = backup.data.brandKits.length;
      }

      safeSetItem('qr-brand-kits', JSON.stringify(newKits));
    }

    // Import dynamic QRs
    if (backup.data.dynamicQRs && backup.data.dynamicQRs.length > 0) {
      const existingQRs = getDynamicQRs();
      const existingIds = new Set(existingQRs.map(q => q.id));

      let newQRs: DynamicQR[];
      if (mergeDynamicQRs) {
        const newItems = backup.data.dynamicQRs.filter(q => !existingIds.has(q.id));
        newQRs = [...existingQRs, ...newItems];
        result.imported.dynamicQRs = newItems.length;
      } else {
        newQRs = backup.data.dynamicQRs;
        result.imported.dynamicQRs = backup.data.dynamicQRs.length;
      }

      safeSetItem('qr-dynamic-codes', JSON.stringify(newQRs));
    }

    // Import analytics (optional, can be large)
    if (importAnalytics && backup.data.analytics && backup.data.analytics.length > 0) {
      const existingAnalytics = getAnalyticsEvents();
      const existingIds = new Set(existingAnalytics.map(a => a.id));
      const newItems = backup.data.analytics.filter(a => !existingIds.has(a.id));
      const merged = [...existingAnalytics, ...newItems].slice(-1000); // Keep max 1000
      safeSetItem('qr-analytics-events', JSON.stringify(merged));
      result.imported.analytics = newItems.length;
    }

    // Import favorites
    if (backup.data.favorites && backup.data.favorites.length > 0) {
      const existingFavorites = getFavorites().map(f => f.qrId);
      const merged = Array.from(new Set([...existingFavorites, ...backup.data.favorites]));
      safeSetItem('qr-favorites', JSON.stringify(merged));
      result.imported.favorites = backup.data.favorites.length;
    }

    // Import user preferences
    if (importPreferences && backup.data.userPreferences) {
      Object.entries(backup.data.userPreferences).forEach(([key, value]) => {
        try {
          safeSetItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch (e) {
          result.warnings.push(`Could not import preference: ${key}`);
        }
      });
    }

  } catch (error) {
    result.success = false;
    result.errors.push(error instanceof Error ? error.message : 'Unknown error during import');
  }

  return result;
}

/**
 * Parse and import a backup file
 */
export async function importBackupFile(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const data = JSON.parse(content);

        const validation = validateBackup(data);
        if (!validation.valid) {
          resolve({
            success: false,
            imported: { history: 0, presets: 0, themes: 0, brandKits: 0, dynamicQRs: 0, analytics: 0, favorites: 0 },
            errors: validation.errors,
            warnings: [],
          });
          return;
        }

        const result = importBackup(data as BackupData);
        resolve(result);
      } catch (error) {
        resolve({
          success: false,
          imported: { history: 0, presets: 0, themes: 0, brandKits: 0, dynamicQRs: 0, analytics: 0, favorites: 0 },
          errors: ['Invalid JSON file'],
          warnings: [],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        imported: { history: 0, presets: 0, themes: 0, brandKits: 0, dynamicQRs: 0, analytics: 0, favorites: 0 },
        errors: ['Could not read file'],
        warnings: [],
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Get backup size estimate
 */
export function getBackupSizeEstimate(): { bytes: number; formatted: string } {
  const backup = exportAllData();
  const json = JSON.stringify(backup);
  const bytes = new Blob([json]).size;

  const units = ['B', 'KB', 'MB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return {
    bytes,
    formatted: `${size.toFixed(1)} ${units[unitIndex]}`,
  };
}

/**
 * Clear all user data (with confirmation)
 */
export function clearAllData(): void {
  const keys = [
    'qr-history',
    'qr-user-presets',
    'qr-custom-themes',
    'qr-brand-kits',
    'qr-dynamic-codes',
    'qr-analytics-events',
    'qr-favorites',
    'user-preferences',
    'qr-default-settings',
    'accessibility-settings',
  ];

  keys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Ignore errors
    }
  });
}
