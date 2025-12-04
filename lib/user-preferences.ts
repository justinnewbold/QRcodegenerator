/**
 * User Preferences System
 * Manages user settings with localStorage persistence
 */

export interface UserPreferences {
  // QR Code defaults
  defaultSize: number;
  defaultErrorCorrection: 'L' | 'M' | 'Q' | 'H';
  defaultForegroundColor: string;
  defaultBackgroundColor: string;
  defaultMargin: number;
  defaultDotStyle: 'squares' | 'dots' | 'rounded' | 'extra-rounded' | 'classy';
  defaultCornerStyle: 'square' | 'rounded' | 'dots' | 'extra-rounded';

  // UI preferences
  theme: 'light' | 'dark' | 'system';
  compactMode: boolean;
  showAdvancedOptions: boolean;
  autoPreview: boolean;

  // Export preferences
  defaultExportFormat: 'png' | 'svg' | 'jpeg' | 'webp' | 'pdf';
  defaultExportQuality: number;
  includeMarginInExport: boolean;

  // History preferences
  maxHistoryItems: number;
  autoSaveToHistory: boolean;

  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';

  // Notifications
  showInstallPrompt: boolean;
  showTips: boolean;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  // QR Code defaults
  defaultSize: 300,
  defaultErrorCorrection: 'M',
  defaultForegroundColor: '#000000',
  defaultBackgroundColor: '#ffffff',
  defaultMargin: 4,
  defaultDotStyle: 'squares',
  defaultCornerStyle: 'square',

  // UI preferences
  theme: 'system',
  compactMode: false,
  showAdvancedOptions: false,
  autoPreview: true,

  // Export preferences
  defaultExportFormat: 'png',
  defaultExportQuality: 92,
  includeMarginInExport: true,

  // History preferences
  maxHistoryItems: 100,
  autoSaveToHistory: true,

  // Accessibility
  reducedMotion: false,
  highContrast: false,
  fontSize: 'medium',

  // Notifications
  showInstallPrompt: true,
  showTips: true,
};

const STORAGE_KEY = 'qr-generator-preferences';

/**
 * Get all user preferences
 */
export function getPreferences(): UserPreferences {
  if (typeof window === 'undefined') {
    return DEFAULT_PREFERENCES;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_PREFERENCES;
    }

    const parsed = JSON.parse(stored);
    // Merge with defaults to handle new preference fields
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return DEFAULT_PREFERENCES;
  }
}

/**
 * Get a single preference value
 */
export function getPreference<K extends keyof UserPreferences>(
  key: K
): UserPreferences[K] {
  const prefs = getPreferences();
  return prefs[key];
}

/**
 * Save all preferences
 */
export function savePreferences(preferences: Partial<UserPreferences>): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const current = getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch event for reactive updates
    window.dispatchEvent(
      new CustomEvent('preferences-changed', { detail: updated })
    );
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

/**
 * Reset all preferences to defaults
 */
export function resetPreferences(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent('preferences-changed', { detail: DEFAULT_PREFERENCES })
    );
  } catch (error) {
    console.error('Failed to reset preferences:', error);
  }
}

/**
 * Export preferences as JSON string
 */
export function exportPreferences(): string {
  const prefs = getPreferences();
  return JSON.stringify(prefs, null, 2);
}

/**
 * Import preferences from JSON string
 */
export function importPreferences(json: string): boolean {
  try {
    const parsed = JSON.parse(json);

    // Validate that it's a valid preferences object
    if (typeof parsed !== 'object' || parsed === null) {
      return false;
    }

    // Only keep valid preference keys
    const validKeys = Object.keys(DEFAULT_PREFERENCES);
    const filtered: Partial<UserPreferences> = {};

    for (const key of validKeys) {
      if (key in parsed) {
        (filtered as Record<string, unknown>)[key] = parsed[key];
      }
    }

    savePreferences(filtered);
    return true;
  } catch (error) {
    console.error('Failed to import preferences:', error);
    return false;
  }
}

/**
 * Get default preferences object
 */
export function getDefaultPreferences(): UserPreferences {
  return { ...DEFAULT_PREFERENCES };
}

/**
 * Check if preferences have been modified from defaults
 */
export function hasCustomPreferences(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored !== null;
}

/**
 * Preference categories for UI organization
 */
export const PREFERENCE_CATEGORIES = {
  qrDefaults: {
    label: 'QR Code Defaults',
    description: 'Default settings for new QR codes',
    keys: [
      'defaultSize',
      'defaultErrorCorrection',
      'defaultForegroundColor',
      'defaultBackgroundColor',
      'defaultMargin',
      'defaultDotStyle',
      'defaultCornerStyle',
    ],
  },
  ui: {
    label: 'User Interface',
    description: 'Customize the app appearance',
    keys: ['theme', 'compactMode', 'showAdvancedOptions', 'autoPreview'],
  },
  export: {
    label: 'Export Settings',
    description: 'Default export options',
    keys: ['defaultExportFormat', 'defaultExportQuality', 'includeMarginInExport'],
  },
  history: {
    label: 'History',
    description: 'History management settings',
    keys: ['maxHistoryItems', 'autoSaveToHistory'],
  },
  accessibility: {
    label: 'Accessibility',
    description: 'Accessibility options',
    keys: ['reducedMotion', 'highContrast', 'fontSize'],
  },
  notifications: {
    label: 'Notifications',
    description: 'Control prompts and tips',
    keys: ['showInstallPrompt', 'showTips'],
  },
} as const;
