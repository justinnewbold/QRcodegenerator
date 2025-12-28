/**
 * QR Code Preset Manager
 * Save, export, import, and share QR code presets
 */

export interface QRPreset {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;

  // Content settings
  type: string;
  contentTemplate?: string; // Template with placeholders like {{name}}

  // Style settings
  size: number;
  errorCorrection: 'L' | 'M' | 'Q' | 'H';
  margin: number;
  foregroundColor: string;
  backgroundColor: string;
  dotStyle: string;
  cornerStyle: string;

  // Advanced settings
  transparentBackground?: boolean;
  eyeColors?: {
    topLeft?: string;
    topRight?: string;
    bottomLeft?: string;
  };

  // Gradient
  gradient?: {
    enabled: boolean;
    type: 'linear' | 'radial';
    colors: string[];
    rotation?: number;
  };

  // Frame
  frame?: {
    style: string;
    text?: string;
    color?: string;
    backgroundColor?: string;
  };

  // Logo
  logo?: {
    enabled: boolean;
    size?: number;
    padding?: number;
  };

  // Metadata
  category?: string;
  tags?: string[];
  author?: string;
  isBuiltIn?: boolean;
}

const STORAGE_KEY = 'qr-presets';
const FAVORITES_KEY = 'qr-preset-favorites';

// Built-in presets
export const BUILT_IN_PRESETS: QRPreset[] = [
  {
    id: 'minimal-black',
    name: 'Minimal Black',
    description: 'Clean, simple black QR code',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    type: 'url',
    size: 300,
    errorCorrection: 'M',
    margin: 4,
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    dotStyle: 'squares',
    cornerStyle: 'square',
    category: 'minimal',
    tags: ['simple', 'classic'],
  },
  {
    id: 'modern-purple',
    name: 'Modern Purple',
    description: 'Stylish purple with rounded corners',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    type: 'url',
    size: 300,
    errorCorrection: 'M',
    margin: 4,
    foregroundColor: '#7c3aed',
    backgroundColor: '#ffffff',
    dotStyle: 'rounded',
    cornerStyle: 'rounded',
    category: 'modern',
    tags: ['colorful', 'rounded'],
  },
  {
    id: 'dots-gradient',
    name: 'Gradient Dots',
    description: 'Circular dots with gradient',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    type: 'url',
    size: 300,
    errorCorrection: 'H',
    margin: 4,
    foregroundColor: '#3b82f6',
    backgroundColor: '#ffffff',
    dotStyle: 'dots',
    cornerStyle: 'dots',
    gradient: {
      enabled: true,
      type: 'linear',
      colors: ['#3b82f6', '#8b5cf6'],
      rotation: 45,
    },
    category: 'creative',
    tags: ['gradient', 'dots'],
  },
  {
    id: 'business-card',
    name: 'Business Card',
    description: 'Professional style for business cards',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    type: 'vcard',
    size: 256,
    errorCorrection: 'Q',
    margin: 2,
    foregroundColor: '#1f2937',
    backgroundColor: '#ffffff',
    dotStyle: 'rounded',
    cornerStyle: 'rounded',
    frame: {
      style: 'simple',
      text: 'SCAN ME',
      color: '#1f2937',
    },
    category: 'business',
    tags: ['professional', 'vcard'],
  },
  {
    id: 'wifi-blue',
    name: 'WiFi Share',
    description: 'Perfect for WiFi sharing',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    type: 'wifi',
    size: 300,
    errorCorrection: 'M',
    margin: 4,
    foregroundColor: '#0ea5e9',
    backgroundColor: '#ffffff',
    dotStyle: 'extra-rounded',
    cornerStyle: 'extra-rounded',
    eyeColors: {
      topLeft: '#0284c7',
      topRight: '#0284c7',
      bottomLeft: '#0284c7',
    },
    category: 'utility',
    tags: ['wifi', 'network'],
  },
  {
    id: 'social-pink',
    name: 'Social Media',
    description: 'Vibrant style for social links',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    type: 'url',
    size: 300,
    errorCorrection: 'M',
    margin: 4,
    foregroundColor: '#ec4899',
    backgroundColor: '#ffffff',
    dotStyle: 'dots',
    cornerStyle: 'rounded',
    gradient: {
      enabled: true,
      type: 'linear',
      colors: ['#ec4899', '#f97316'],
      rotation: 135,
    },
    category: 'social',
    tags: ['social', 'vibrant'],
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'QR code for dark backgrounds',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    type: 'url',
    size: 300,
    errorCorrection: 'M',
    margin: 4,
    foregroundColor: '#ffffff',
    backgroundColor: '#0a0a0a',
    dotStyle: 'rounded',
    cornerStyle: 'rounded',
    category: 'dark',
    tags: ['dark', 'inverted'],
  },
  {
    id: 'classy-gold',
    name: 'Classy Gold',
    description: 'Elegant gold styling',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    isBuiltIn: true,
    type: 'url',
    size: 300,
    errorCorrection: 'H',
    margin: 4,
    foregroundColor: '#b45309',
    backgroundColor: '#fffbeb',
    dotStyle: 'classy',
    cornerStyle: 'square',
    eyeColors: {
      topLeft: '#92400e',
      topRight: '#92400e',
      bottomLeft: '#92400e',
    },
    category: 'elegant',
    tags: ['gold', 'premium'],
  },
];

/**
 * Get all presets (built-in + user-created)
 */
export function getAllPresets(): QRPreset[] {
  const userPresets = getUserPresets();
  return [...BUILT_IN_PRESETS, ...userPresets];
}

/**
 * Get user-created presets only
 */
export function getUserPresets(): QRPreset[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save a new preset
 */
export function savePreset(preset: Omit<QRPreset, 'id' | 'createdAt' | 'updatedAt'>): QRPreset {
  const presets = getUserPresets();

  const newPreset: QRPreset = {
    ...preset,
    id: `preset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isBuiltIn: false,
  };

  presets.push(newPreset);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));

  return newPreset;
}

/**
 * Update an existing preset
 */
export function updatePreset(id: string, updates: Partial<QRPreset>): QRPreset | null {
  const presets = getUserPresets();
  const index = presets.findIndex(p => p.id === id);

  if (index === -1) return null;

  presets[index] = {
    ...presets[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  return presets[index];
}

/**
 * Delete a preset
 */
export function deletePreset(id: string): boolean {
  const presets = getUserPresets();
  const filtered = presets.filter(p => p.id !== id);

  if (filtered.length === presets.length) return false;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));

  // Also remove from favorites
  removeFavorite(id);

  return true;
}

/**
 * Get a preset by ID
 */
export function getPresetById(id: string): QRPreset | undefined {
  return getAllPresets().find(p => p.id === id);
}

/**
 * Get presets by category
 */
export function getPresetsByCategory(category: string): QRPreset[] {
  return getAllPresets().filter(p => p.category === category);
}

/**
 * Search presets
 */
export function searchPresets(query: string): QRPreset[] {
  const lowerQuery = query.toLowerCase();
  return getAllPresets().filter(p =>
    p.name.toLowerCase().includes(lowerQuery) ||
    p.description?.toLowerCase().includes(lowerQuery) ||
    p.tags?.some(t => t.toLowerCase().includes(lowerQuery)) ||
    p.category?.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get favorite preset IDs
 */
export function getFavorites(): string[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Add to favorites
 */
export function addFavorite(id: string): void {
  const favorites = getFavorites();
  if (!favorites.includes(id)) {
    favorites.push(id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

/**
 * Remove from favorites
 */
export function removeFavorite(id: string): void {
  const favorites = getFavorites().filter(f => f !== id);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

/**
 * Check if preset is favorited
 */
export function isFavorite(id: string): boolean {
  return getFavorites().includes(id);
}

/**
 * Export a preset as JSON
 */
export function exportPresetAsJson(id: string): string | null {
  const preset = getPresetById(id);
  if (!preset) return null;

  const exportData = {
    ...preset,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Export multiple presets
 */
export function exportPresetsAsJson(ids: string[]): string {
  const presets = ids
    .map(id => getPresetById(id))
    .filter((p): p is QRPreset => p !== undefined);

  return JSON.stringify({
    presets,
    exportedAt: new Date().toISOString(),
    version: '1.0',
  }, null, 2);
}

/**
 * Import a preset from JSON
 */
export function importPresetFromJson(json: string): QRPreset | null {
  try {
    const data = JSON.parse(json);

    // Check if it's a single preset or a collection
    if (data.presets && Array.isArray(data.presets)) {
      // Import all presets from collection
      const imported: QRPreset[] = [];
      for (const p of data.presets) {
        const preset = importSinglePreset(p);
        if (preset) imported.push(preset);
      }
      return imported[0] || null;
    }

    return importSinglePreset(data);
  } catch {
    return null;
  }
}

function importSinglePreset(data: Partial<QRPreset>): QRPreset | null {
  // Validate required fields
  if (!data.name || !data.type) {
    return null;
  }

  return savePreset({
    name: data.name,
    description: data.description,
    type: data.type,
    contentTemplate: data.contentTemplate,
    size: data.size || 300,
    errorCorrection: data.errorCorrection || 'M',
    margin: data.margin ?? 4,
    foregroundColor: data.foregroundColor || '#000000',
    backgroundColor: data.backgroundColor || '#ffffff',
    dotStyle: data.dotStyle || 'squares',
    cornerStyle: data.cornerStyle || 'square',
    transparentBackground: data.transparentBackground,
    eyeColors: data.eyeColors,
    gradient: data.gradient,
    frame: data.frame,
    logo: data.logo,
    category: data.category,
    tags: data.tags,
    author: data.author,
  });
}

/**
 * Generate a shareable URL for a preset
 */
export function generatePresetShareUrl(id: string): string | null {
  if (typeof window === 'undefined') return null;

  const preset = getPresetById(id);
  if (!preset) return null;

  const minified = {
    n: preset.name,
    t: preset.type,
    s: preset.size,
    e: preset.errorCorrection,
    m: preset.margin,
    fg: preset.foregroundColor.replace('#', ''),
    bg: preset.backgroundColor.replace('#', ''),
    ds: preset.dotStyle,
    cs: preset.cornerStyle,
    g: preset.gradient,
    f: preset.frame,
    ec: preset.eyeColors,
  };

  const encoded = btoa(JSON.stringify(minified))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${window.location.origin}/?preset=${encoded}`;
}

/**
 * Parse a preset from URL
 */
export function parsePresetFromUrl(): QRPreset | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const encoded = params.get('preset');
  if (!encoded) return null;

  try {
    let padded = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (padded.length % 4) padded += '=';

    const data = JSON.parse(atob(padded));
    return {
      id: 'shared-preset',
      name: data.n,
      type: data.t,
      size: data.s,
      errorCorrection: data.e,
      margin: data.m,
      foregroundColor: `#${data.fg}`,
      backgroundColor: `#${data.bg}`,
      dotStyle: data.ds,
      cornerStyle: data.cs,
      gradient: data.g,
      frame: data.f,
      eyeColors: data.ec,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Imported from shared link',
    };
  } catch {
    return null;
  }
}

/**
 * Get unique categories from all presets
 */
export function getCategories(): string[] {
  const presets = getAllPresets();
  const categories = new Set(presets.map(p => p.category).filter(Boolean));
  return Array.from(categories) as string[];
}

/**
 * Get unique tags from all presets
 */
export function getTags(): string[] {
  const presets = getAllPresets();
  const tags = new Set(presets.flatMap(p => p.tags || []));
  return Array.from(tags);
}

/**
 * Duplicate a preset
 */
export function duplicatePreset(id: string): QRPreset | null {
  const preset = getPresetById(id);
  if (!preset) return null;

  const { id: _, createdAt, updatedAt, isBuiltIn, ...rest } = preset;
  return savePreset({
    ...rest,
    name: `${preset.name} (Copy)`,
  });
}
