/**
 * High Contrast Mode
 * Accessibility feature for users with visual impairments
 */

export type ContrastMode = 'normal' | 'high' | 'high-dark' | 'high-light';

interface HighContrastConfig {
  mode: ContrastMode;
  enabled: boolean;
  customColors?: {
    foreground: string;
    background: string;
    accent: string;
    border: string;
  };
}

const STORAGE_KEY = 'high-contrast-settings';

const HIGH_CONTRAST_THEMES: Record<ContrastMode, {
  foreground: string;
  background: string;
  accent: string;
  border: string;
  muted: string;
}> = {
  normal: {
    foreground: 'inherit',
    background: 'inherit',
    accent: 'inherit',
    border: 'inherit',
    muted: 'inherit',
  },
  high: {
    foreground: '#000000',
    background: '#FFFFFF',
    accent: '#0000FF',
    border: '#000000',
    muted: '#666666',
  },
  'high-dark': {
    foreground: '#FFFFFF',
    background: '#000000',
    accent: '#FFFF00',
    border: '#FFFFFF',
    muted: '#CCCCCC',
  },
  'high-light': {
    foreground: '#000000',
    background: '#FFFFFF',
    accent: '#0000CC',
    border: '#000000',
    muted: '#333333',
  },
};

/**
 * Get current high contrast settings
 */
export function getHighContrastSettings(): HighContrastConfig {
  if (typeof window === 'undefined') {
    return { mode: 'normal', enabled: false };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore errors
  }

  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const prefersHighContrast = window.matchMedia('(prefers-contrast: more)').matches;

  if (prefersHighContrast) {
    return {
      mode: prefersDark ? 'high-dark' : 'high-light',
      enabled: true,
    };
  }

  return { mode: 'normal', enabled: false };
}

/**
 * Save high contrast settings
 */
export function saveHighContrastSettings(config: HighContrastConfig): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Apply high contrast mode to the document
 */
export function applyHighContrastMode(mode: ContrastMode): void {
  if (typeof document === 'undefined') return;

  const theme = HIGH_CONTRAST_THEMES[mode];
  const root = document.documentElement;

  if (mode === 'normal') {
    // Remove high contrast styles
    root.classList.remove('high-contrast', 'high-contrast-dark', 'high-contrast-light');
    root.style.removeProperty('--hc-foreground');
    root.style.removeProperty('--hc-background');
    root.style.removeProperty('--hc-accent');
    root.style.removeProperty('--hc-border');
    root.style.removeProperty('--hc-muted');
    return;
  }

  // Apply high contrast CSS variables
  root.style.setProperty('--hc-foreground', theme.foreground);
  root.style.setProperty('--hc-background', theme.background);
  root.style.setProperty('--hc-accent', theme.accent);
  root.style.setProperty('--hc-border', theme.border);
  root.style.setProperty('--hc-muted', theme.muted);

  // Add appropriate class
  root.classList.remove('high-contrast', 'high-contrast-dark', 'high-contrast-light');
  root.classList.add('high-contrast');

  if (mode === 'high-dark') {
    root.classList.add('high-contrast-dark');
  } else if (mode === 'high-light') {
    root.classList.add('high-contrast-light');
  }
}

/**
 * Toggle high contrast mode
 */
export function toggleHighContrast(): ContrastMode {
  const current = getHighContrastSettings();
  const modes: ContrastMode[] = ['normal', 'high', 'high-dark', 'high-light'];
  const currentIndex = modes.indexOf(current.mode);
  const nextMode = modes[(currentIndex + 1) % modes.length];

  saveHighContrastSettings({
    mode: nextMode,
    enabled: nextMode !== 'normal',
  });

  applyHighContrastMode(nextMode);
  return nextMode;
}

/**
 * Enable specific high contrast mode
 */
export function enableHighContrast(mode: ContrastMode = 'high'): void {
  saveHighContrastSettings({
    mode,
    enabled: mode !== 'normal',
  });
  applyHighContrastMode(mode);
}

/**
 * Disable high contrast mode
 */
export function disableHighContrast(): void {
  saveHighContrastSettings({
    mode: 'normal',
    enabled: false,
  });
  applyHighContrastMode('normal');
}

/**
 * Initialize high contrast mode on page load
 */
export function initHighContrastMode(): void {
  if (typeof window === 'undefined') return;

  const settings = getHighContrastSettings();
  if (settings.enabled) {
    applyHighContrastMode(settings.mode);
  }

  // Listen for system preference changes
  const mediaQuery = window.matchMedia('(prefers-contrast: more)');
  mediaQuery.addEventListener('change', (e) => {
    if (e.matches) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      enableHighContrast(prefersDark ? 'high-dark' : 'high-light');
    }
  });
}

/**
 * Get CSS for high contrast mode
 * This can be injected as a style tag
 */
export function getHighContrastCSS(): string {
  return `
    .high-contrast {
      --foreground: var(--hc-foreground) !important;
      --background: var(--hc-background) !important;
      --primary: var(--hc-accent) !important;
      --border: var(--hc-border) !important;
      --muted-foreground: var(--hc-muted) !important;
    }

    .high-contrast * {
      border-color: var(--hc-border) !important;
    }

    .high-contrast button,
    .high-contrast a {
      outline: 2px solid transparent;
    }

    .high-contrast button:focus,
    .high-contrast a:focus {
      outline: 3px solid var(--hc-accent) !important;
      outline-offset: 2px;
    }

    .high-contrast img {
      filter: contrast(1.2);
    }

    .high-contrast-dark {
      background-color: #000000 !important;
      color: #FFFFFF !important;
    }

    .high-contrast-light {
      background-color: #FFFFFF !important;
      color: #000000 !important;
    }

    /* Ensure sufficient contrast for all text */
    .high-contrast p,
    .high-contrast span,
    .high-contrast label,
    .high-contrast h1,
    .high-contrast h2,
    .high-contrast h3,
    .high-contrast h4,
    .high-contrast h5,
    .high-contrast h6 {
      color: var(--hc-foreground) !important;
    }

    /* Links in high contrast */
    .high-contrast a {
      color: var(--hc-accent) !important;
      text-decoration: underline !important;
    }

    /* Buttons in high contrast */
    .high-contrast button {
      border: 2px solid var(--hc-border) !important;
    }

    /* Inputs in high contrast */
    .high-contrast input,
    .high-contrast textarea,
    .high-contrast select {
      border: 2px solid var(--hc-border) !important;
      background-color: var(--hc-background) !important;
      color: var(--hc-foreground) !important;
    }

    /* Cards and containers */
    .high-contrast .card,
    .high-contrast [class*="rounded"] {
      border: 2px solid var(--hc-border) !important;
    }
  `;
}
