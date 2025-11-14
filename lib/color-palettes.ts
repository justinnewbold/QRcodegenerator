export interface ColorPalette {
  name: string;
  category: string;
  foreground: string;
  background: string;
  gradientStart?: string;
  gradientEnd?: string;
  description?: string;
}

export const colorPalettes: ColorPalette[] = [
  // Classic
  {
    name: 'Classic Black',
    category: 'Classic',
    foreground: '#000000',
    background: '#ffffff',
    description: 'Traditional high-contrast QR code'
  },
  {
    name: 'Inverted White',
    category: 'Classic',
    foreground: '#ffffff',
    background: '#000000',
    description: 'High contrast on dark background'
  },

  // Professional
  {
    name: 'Navy Corporate',
    category: 'Professional',
    foreground: '#1e3a8a',
    background: '#f8fafc',
    description: 'Professional navy blue'
  },
  {
    name: 'Forest Green',
    category: 'Professional',
    foreground: '#064e3b',
    background: '#f0fdf4',
    description: 'Elegant forest green'
  },
  {
    name: 'Burgundy',
    category: 'Professional',
    foreground: '#7f1d1d',
    background: '#fef2f2',
    description: 'Sophisticated burgundy'
  },
  {
    name: 'Charcoal',
    category: 'Professional',
    foreground: '#374151',
    background: '#f9fafb',
    description: 'Modern charcoal gray'
  },

  // Vibrant
  {
    name: 'Electric Blue',
    category: 'Vibrant',
    foreground: '#2563eb',
    background: '#dbeafe',
    description: 'Bright and energetic'
  },
  {
    name: 'Coral',
    category: 'Vibrant',
    foreground: '#f97316',
    background: '#fff7ed',
    description: 'Warm coral orange'
  },
  {
    name: 'Violet',
    category: 'Vibrant',
    foreground: '#7c3aed',
    background: '#f5f3ff',
    description: 'Bold violet purple'
  },
  {
    name: 'Magenta',
    category: 'Vibrant',
    foreground: '#db2777',
    background: '#fdf2f8',
    description: 'Eye-catching magenta'
  },
  {
    name: 'Teal',
    category: 'Vibrant',
    foreground: '#0d9488',
    background: '#f0fdfa',
    description: 'Fresh teal'
  },

  // Gradient
  {
    name: 'Sunset',
    category: 'Gradient',
    foreground: '#f97316',
    background: '#ffffff',
    gradientStart: '#f97316',
    gradientEnd: '#dc2626',
    description: 'Warm sunset gradient'
  },
  {
    name: 'Ocean',
    category: 'Gradient',
    foreground: '#0ea5e9',
    background: '#ffffff',
    gradientStart: '#0ea5e9',
    gradientEnd: '#3b82f6',
    description: 'Deep ocean blue gradient'
  },
  {
    name: 'Purple Haze',
    category: 'Gradient',
    foreground: '#a855f7',
    background: '#ffffff',
    gradientStart: '#a855f7',
    gradientEnd: '#ec4899',
    description: 'Purple to pink gradient'
  },
  {
    name: 'Forest',
    category: 'Gradient',
    foreground: '#10b981',
    background: '#ffffff',
    gradientStart: '#10b981',
    gradientEnd: '#059669',
    description: 'Fresh forest gradient'
  },
  {
    name: 'Fire',
    category: 'Gradient',
    foreground: '#ef4444',
    background: '#ffffff',
    gradientStart: '#fbbf24',
    gradientEnd: '#ef4444',
    description: 'Hot fire gradient'
  },
  {
    name: 'Aurora',
    category: 'Gradient',
    foreground: '#8b5cf6',
    background: '#ffffff',
    gradientStart: '#06b6d4',
    gradientEnd: '#8b5cf6',
    description: 'Aurora borealis'
  },

  // Pastel
  {
    name: 'Soft Pink',
    category: 'Pastel',
    foreground: '#ec4899',
    background: '#fce7f3',
    description: 'Gentle pastel pink'
  },
  {
    name: 'Mint',
    category: 'Pastel',
    foreground: '#10b981',
    background: '#d1fae5',
    description: 'Refreshing mint'
  },
  {
    name: 'Lavender',
    category: 'Pastel',
    foreground: '#a78bfa',
    background: '#ede9fe',
    description: 'Soothing lavender'
  },
  {
    name: 'Peach',
    category: 'Pastel',
    foreground: '#fb923c',
    background: '#fed7aa',
    description: 'Warm peach'
  },

  // Brand Colors
  {
    name: 'Facebook',
    category: 'Brand',
    foreground: '#1877f2',
    background: '#ffffff',
    description: 'Facebook blue'
  },
  {
    name: 'Instagram',
    category: 'Brand',
    foreground: '#e4405f',
    background: '#ffffff',
    gradientStart: '#f58529',
    gradientEnd: '#dd2a7b',
    description: 'Instagram gradient'
  },
  {
    name: 'Twitter',
    category: 'Brand',
    foreground: '#1da1f2',
    background: '#ffffff',
    description: 'Twitter blue'
  },
  {
    name: 'LinkedIn',
    category: 'Brand',
    foreground: '#0a66c2',
    background: '#ffffff',
    description: 'LinkedIn blue'
  },
  {
    name: 'Spotify',
    category: 'Brand',
    foreground: '#1db954',
    background: '#191414',
    description: 'Spotify green on black'
  },
  {
    name: 'YouTube',
    category: 'Brand',
    foreground: '#ff0000',
    background: '#ffffff',
    description: 'YouTube red'
  },
];

// Local storage for custom palettes
const CUSTOM_PALETTES_KEY = 'qr_custom_palettes';

export function saveCustomPalette(palette: ColorPalette): void {
  const customPalettes = getCustomPalettes();
  customPalettes.push({
    ...palette,
    category: 'Custom',
  });
  localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify(customPalettes));
}

export function getCustomPalettes(): ColorPalette[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(CUSTOM_PALETTES_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function deleteCustomPalette(name: string): void {
  const customPalettes = getCustomPalettes().filter(p => p.name !== name);
  localStorage.setItem(CUSTOM_PALETTES_KEY, JSON.stringify(customPalettes));
}

export function getAllPalettes(): ColorPalette[] {
  return [...colorPalettes, ...getCustomPalettes()];
}

export function getPalettesByCategory(category: string): ColorPalette[] {
  return getAllPalettes().filter(p => p.category === category);
}

export function getCategories(): string[] {
  const categories = new Set(getAllPalettes().map(p => p.category));
  return Array.from(categories);
}
