/**
 * Custom Theme System
 * Create, save, and share custom color themes
 */

export interface CustomTheme {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;

  // App colors
  colors: {
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    primaryForeground: string;
    secondary: string;
    secondaryForeground: string;
    muted: string;
    mutedForeground: string;
    accent: string;
    accentForeground: string;
    border: string;
    ring: string;
  };

  // QR code defaults
  qrDefaults?: {
    foregroundColor: string;
    backgroundColor: string;
    dotStyle: string;
    cornerStyle: string;
  };

  // Metadata
  author?: string;
  tags?: string[];
  isBuiltIn?: boolean;
}

const STORAGE_KEY = 'qr-custom-themes';
const ACTIVE_THEME_KEY = 'qr-active-custom-theme';

// Built-in themes
export const BUILT_IN_THEMES: CustomTheme[] = [
  {
    id: 'default-dark',
    name: 'Default Dark',
    description: 'The default dark theme',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    colors: {
      background: '#0a0a0a',
      foreground: '#fafafa',
      card: '#0a0a0a',
      cardForeground: '#fafafa',
      primary: '#7c3aed',
      primaryForeground: '#fafafa',
      secondary: '#27272a',
      secondaryForeground: '#fafafa',
      muted: '#27272a',
      mutedForeground: '#a1a1aa',
      accent: '#27272a',
      accentForeground: '#fafafa',
      border: '#27272a',
      ring: '#7c3aed',
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Calm ocean-inspired theme',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    colors: {
      background: '#0c1929',
      foreground: '#e2e8f0',
      card: '#0f2744',
      cardForeground: '#e2e8f0',
      primary: '#0ea5e9',
      primaryForeground: '#ffffff',
      secondary: '#1e3a5f',
      secondaryForeground: '#e2e8f0',
      muted: '#1e3a5f',
      mutedForeground: '#94a3b8',
      accent: '#1e3a5f',
      accentForeground: '#e2e8f0',
      border: '#1e3a5f',
      ring: '#0ea5e9',
    },
    qrDefaults: {
      foregroundColor: '#0ea5e9',
      backgroundColor: '#0c1929',
      dotStyle: 'rounded',
      cornerStyle: 'rounded',
    },
  },
  {
    id: 'forest-green',
    name: 'Forest Green',
    description: 'Nature-inspired green theme',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    colors: {
      background: '#0d1f0d',
      foreground: '#e2f0e2',
      card: '#132b13',
      cardForeground: '#e2f0e2',
      primary: '#22c55e',
      primaryForeground: '#ffffff',
      secondary: '#1a3d1a',
      secondaryForeground: '#e2f0e2',
      muted: '#1a3d1a',
      mutedForeground: '#86a086',
      accent: '#1a3d1a',
      accentForeground: '#e2f0e2',
      border: '#1a3d1a',
      ring: '#22c55e',
    },
    qrDefaults: {
      foregroundColor: '#22c55e',
      backgroundColor: '#0d1f0d',
      dotStyle: 'dots',
      cornerStyle: 'rounded',
    },
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm sunset colors',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    colors: {
      background: '#1f1410',
      foreground: '#fef3e8',
      card: '#2d1e17',
      cardForeground: '#fef3e8',
      primary: '#f97316',
      primaryForeground: '#ffffff',
      secondary: '#3d2920',
      secondaryForeground: '#fef3e8',
      muted: '#3d2920',
      mutedForeground: '#c9a892',
      accent: '#3d2920',
      accentForeground: '#fef3e8',
      border: '#3d2920',
      ring: '#f97316',
    },
    qrDefaults: {
      foregroundColor: '#f97316',
      backgroundColor: '#1f1410',
      dotStyle: 'extra-rounded',
      cornerStyle: 'extra-rounded',
    },
  },
  {
    id: 'midnight-purple',
    name: 'Midnight Purple',
    description: 'Deep purple night theme',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    colors: {
      background: '#13081f',
      foreground: '#f3e8ff',
      card: '#1e1033',
      cardForeground: '#f3e8ff',
      primary: '#a855f7',
      primaryForeground: '#ffffff',
      secondary: '#2d1a4a',
      secondaryForeground: '#f3e8ff',
      muted: '#2d1a4a',
      mutedForeground: '#a78bca',
      accent: '#2d1a4a',
      accentForeground: '#f3e8ff',
      border: '#2d1a4a',
      ring: '#a855f7',
    },
    qrDefaults: {
      foregroundColor: '#a855f7',
      backgroundColor: '#13081f',
      dotStyle: 'rounded',
      cornerStyle: 'dots',
    },
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Elegant rose gold theme',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    colors: {
      background: '#1f1418',
      foreground: '#fff0f3',
      card: '#2d1d23',
      cardForeground: '#fff0f3',
      primary: '#f43f5e',
      primaryForeground: '#ffffff',
      secondary: '#3d282f',
      secondaryForeground: '#fff0f3',
      muted: '#3d282f',
      mutedForeground: '#c9a0ab',
      accent: '#3d282f',
      accentForeground: '#fff0f3',
      border: '#3d282f',
      ring: '#f43f5e',
    },
    qrDefaults: {
      foregroundColor: '#f43f5e',
      backgroundColor: '#1f1418',
      dotStyle: 'classy',
      cornerStyle: 'square',
    },
  },
];

/**
 * Get all custom themes (built-in + user-created)
 */
export function getAllThemes(): CustomTheme[] {
  const customThemes = getCustomThemes();
  return [...BUILT_IN_THEMES, ...customThemes];
}

/**
 * Get user-created themes only
 */
export function getCustomThemes(): CustomTheme[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save a custom theme
 */
export function saveCustomTheme(theme: Omit<CustomTheme, 'id' | 'createdAt' | 'updatedAt'>): CustomTheme {
  const themes = getCustomThemes();

  const newTheme: CustomTheme = {
    ...theme,
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: false,
  };

  themes.push(newTheme);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));

  return newTheme;
}

/**
 * Update an existing custom theme
 */
export function updateCustomTheme(id: string, updates: Partial<CustomTheme>): CustomTheme | null {
  const themes = getCustomThemes();
  const index = themes.findIndex(t => t.id === id);

  if (index === -1) return null;

  themes[index] = {
    ...themes[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(themes));
  return themes[index];
}

/**
 * Delete a custom theme
 */
export function deleteCustomTheme(id: string): boolean {
  const themes = getCustomThemes();
  const filtered = themes.filter(t => t.id !== id);

  if (filtered.length === themes.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  // Clear active theme if it was deleted
  if (getActiveThemeId() === id) {
    clearActiveTheme();
  }

  return true;
}

/**
 * Get a theme by ID
 */
export function getThemeById(id: string): CustomTheme | undefined {
  return getAllThemes().find(t => t.id === id);
}

/**
 * Get the currently active custom theme ID
 */
export function getActiveThemeId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACTIVE_THEME_KEY);
}

/**
 * Set the active custom theme
 */
export function setActiveTheme(id: string): void {
  localStorage.setItem(ACTIVE_THEME_KEY, id);
  applyTheme(id);
}

/**
 * Clear the active custom theme (revert to system theme)
 */
export function clearActiveTheme(): void {
  localStorage.removeItem(ACTIVE_THEME_KEY);
  removeThemeStyles();
}

/**
 * Apply a theme's colors to the document
 */
export function applyTheme(id: string): void {
  const theme = getThemeById(id);
  if (!theme) return;

  const root = document.documentElement;

  // Convert hex to HSL for CSS variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    const hsl = hexToHsl(value);
    const cssKey = camelToKebab(key);
    root.style.setProperty(`--${cssKey}`, hsl);
  });

  root.setAttribute('data-custom-theme', id);
}

/**
 * Remove custom theme styles
 */
export function removeThemeStyles(): void {
  const root = document.documentElement;
  root.removeAttribute('data-custom-theme');

  // Remove custom CSS variables
  const colorKeys = [
    'background', 'foreground', 'card', 'card-foreground',
    'primary', 'primary-foreground', 'secondary', 'secondary-foreground',
    'muted', 'muted-foreground', 'accent', 'accent-foreground',
    'border', 'ring',
  ];

  colorKeys.forEach(key => {
    root.style.removeProperty(`--${key}`);
  });
}

/**
 * Export a theme as JSON
 */
export function exportTheme(id: string): string | null {
  const theme = getThemeById(id);
  if (!theme) return null;

  const exportData = {
    ...theme,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Import a theme from JSON
 */
export function importTheme(json: string): CustomTheme | null {
  try {
    const data = JSON.parse(json);

    // Validate required fields
    if (!data.name || !data.colors) {
      return null;
    }

    // Create new theme from imported data
    return saveCustomTheme({
      name: data.name,
      description: data.description,
      colors: data.colors,
      qrDefaults: data.qrDefaults,
      author: data.author,
      tags: data.tags,
    });
  } catch {
    return null;
  }
}

/**
 * Generate a shareable URL for a theme
 */
export function generateThemeShareUrl(id: string): string | null {
  const theme = getThemeById(id);
  if (!theme) return null;

  const encoded = btoa(JSON.stringify({
    n: theme.name,
    c: theme.colors,
    q: theme.qrDefaults,
  })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

  return `${window.location.origin}/?theme=${encoded}`;
}

/**
 * Parse a theme from URL
 */
export function parseThemeFromUrl(): CustomTheme | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('theme');
  if (!encoded) return null;

  try {
    let padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (padded.length % 4) padded += '=';

    const data = JSON.parse(atob(padded));
    return {
      id: 'shared-theme',
      name: data.n,
      description: 'Imported from shared link',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      colors: data.c,
      qrDefaults: data.q,
    };
  } catch {
    return null;
  }
}

// Utility functions
function hexToHsl(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function camelToKebab(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}
