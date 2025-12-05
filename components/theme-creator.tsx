'use client';

import { useState, useEffect } from 'react';
import {
  CustomTheme,
  getAllThemes,
  saveCustomTheme,
  deleteCustomTheme,
  getActiveThemeId,
  setActiveTheme,
  clearActiveTheme,
  exportTheme,
  importTheme,
  applyTheme,
} from '@/lib/custom-themes';
import {
  Palette,
  X,
  Plus,
  Trash2,
  Download,
  Upload,
  Check,
  Copy,
  Eye,
  EyeOff,
  Share2,
  Sparkles,
} from 'lucide-react';

interface ThemeCreatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ThemeCreator({ isOpen, onClose }: ThemeCreatorProps) {
  const [themes, setThemes] = useState<CustomTheme[]>([]);
  const [activeThemeId, setActiveThemeIdState] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTheme, setEditingTheme] = useState<Partial<CustomTheme> | null>(null);
  const [previewTheme, setPreviewTheme] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Load themes
  useEffect(() => {
    if (isOpen) {
      setThemes(getAllThemes());
      setActiveThemeIdState(getActiveThemeId());
    }
  }, [isOpen]);

  // Initialize new theme
  const startCreating = () => {
    setEditingTheme({
      name: 'My Custom Theme',
      description: '',
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
    });
    setIsCreating(true);
  };

  // Save new theme
  const handleSave = () => {
    if (!editingTheme?.name || !editingTheme?.colors) return;

    const newTheme = saveCustomTheme({
      name: editingTheme.name,
      description: editingTheme.description,
      colors: editingTheme.colors as CustomTheme['colors'],
      qrDefaults: editingTheme.qrDefaults,
    });

    setThemes(getAllThemes());
    setIsCreating(false);
    setEditingTheme(null);

    // Apply the new theme
    setActiveTheme(newTheme.id);
    setActiveThemeIdState(newTheme.id);
  };

  // Delete theme
  const handleDelete = (id: string) => {
    if (confirm('Delete this theme?')) {
      deleteCustomTheme(id);
      setThemes(getAllThemes());
      if (activeThemeId === id) {
        clearActiveTheme();
        setActiveThemeIdState(null);
      }
    }
  };

  // Apply theme
  const handleApply = (id: string) => {
    setActiveTheme(id);
    setActiveThemeIdState(id);
  };

  // Clear active theme
  const handleClear = () => {
    clearActiveTheme();
    setActiveThemeIdState(null);
  };

  // Preview theme on hover
  const handlePreviewStart = (id: string) => {
    setPreviewTheme(id);
    applyTheme(id);
  };

  const handlePreviewEnd = () => {
    setPreviewTheme(null);
    if (activeThemeId) {
      applyTheme(activeThemeId);
    } else {
      clearActiveTheme();
    }
  };

  // Export theme
  const handleExport = (id: string) => {
    const json = exportTheme(id);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `theme-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Import theme
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const theme = importTheme(content);
      if (theme) {
        setThemes(getAllThemes());
        setImportError(null);
      } else {
        setImportError('Invalid theme file');
        setTimeout(() => setImportError(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Copy share URL
  const handleShare = async (id: string) => {
    const theme = themes.find(t => t.id === id);
    if (!theme) return;

    const url = `${window.location.origin}/?theme=${btoa(JSON.stringify({
      n: theme.name,
      c: theme.colors,
    }))}`;

    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isCreating) {
          setIsCreating(false);
          setEditingTheme(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, isCreating, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">
                {isCreating ? 'Create Theme' : 'Theme Gallery'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isCreating ? 'Customize your colors' : 'Choose or create a custom theme'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isCreating && (
              <>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
                  <Upload className="h-4 w-4" />
                  Import
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                <button
                  onClick={startCreating}
                  className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Create
                </button>
              </>
            )}
            <button
              onClick={isCreating ? () => { setIsCreating(false); setEditingTheme(null); } : onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isCreating && editingTheme ? (
            <ThemeEditor
              theme={editingTheme}
              onChange={setEditingTheme}
              onSave={handleSave}
              onCancel={() => { setIsCreating(false); setEditingTheme(null); }}
            />
          ) : (
            <div className="space-y-4">
              {/* Active theme indicator */}
              {activeThemeId && (
                <div className="flex items-center justify-between rounded-lg bg-primary/10 p-3">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">
                      Active: {themes.find(t => t.id === activeThemeId)?.name}
                    </span>
                  </div>
                  <button
                    onClick={handleClear}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Reset to default
                  </button>
                </div>
              )}

              {/* Theme grid */}
              <div className="grid gap-4 sm:grid-cols-2">
                {themes.map((theme) => (
                  <ThemeCard
                    key={theme.id}
                    theme={theme}
                    isActive={activeThemeId === theme.id}
                    isPreviewing={previewTheme === theme.id}
                    onApply={() => handleApply(theme.id)}
                    onDelete={theme.isBuiltIn ? undefined : () => handleDelete(theme.id)}
                    onExport={() => handleExport(theme.id)}
                    onShare={() => handleShare(theme.id)}
                    onPreviewStart={() => handlePreviewStart(theme.id)}
                    onPreviewEnd={handlePreviewEnd}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Import error */}
        {importError && (
          <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-red-500/10 px-4 py-2 text-center text-sm text-red-500">
            {importError}
          </div>
        )}

        {/* Copy notification */}
        {copied && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white">
            Share link copied!
          </div>
        )}
      </div>
    </div>
  );
}

// Theme Card Component
function ThemeCard({
  theme,
  isActive,
  isPreviewing,
  onApply,
  onDelete,
  onExport,
  onShare,
  onPreviewStart,
  onPreviewEnd,
}: {
  theme: CustomTheme;
  isActive: boolean;
  isPreviewing: boolean;
  onApply: () => void;
  onDelete?: () => void;
  onExport: () => void;
  onShare: () => void;
  onPreviewStart: () => void;
  onPreviewEnd: () => void;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border-2 transition-all ${
        isActive
          ? 'border-primary ring-2 ring-primary/20'
          : isPreviewing
          ? 'border-primary/50'
          : 'border-border hover:border-primary/30'
      }`}
      onMouseEnter={onPreviewStart}
      onMouseLeave={onPreviewEnd}
    >
      {/* Color preview */}
      <div
        className="h-24 p-3"
        style={{ backgroundColor: theme.colors.background }}
      >
        <div className="flex h-full gap-2">
          <div
            className="flex-1 rounded-lg p-2"
            style={{ backgroundColor: theme.colors.card }}
          >
            <div
              className="mb-1 h-2 w-12 rounded"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <div
              className="h-1.5 w-8 rounded"
              style={{ backgroundColor: theme.colors.muted }}
            />
          </div>
          <div className="flex flex-col gap-1">
            {[theme.colors.primary, theme.colors.secondary, theme.colors.accent].map((color, i) => (
              <div
                key={i}
                className="h-6 w-6 rounded"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{theme.name}</h3>
              {theme.isBuiltIn && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  Built-in
                </span>
              )}
            </div>
            {theme.description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{theme.description}</p>
            )}
          </div>
          {isActive && <Check className="h-5 w-5 text-primary" />}
        </div>

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={onApply}
            className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary/10 text-primary'
                : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
            }`}
          >
            {isActive ? 'Active' : 'Apply'}
          </button>
          <button
            onClick={onExport}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Export"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={onShare}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Share"
          >
            <Share2 className="h-4 w-4" />
          </button>
          {onDelete && (
            <button
              onClick={onDelete}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Theme Editor Component
function ThemeEditor({
  theme,
  onChange,
  onSave,
  onCancel,
}: {
  theme: Partial<CustomTheme>;
  onChange: (theme: Partial<CustomTheme>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const colorGroups = [
    {
      title: 'Background',
      colors: ['background', 'foreground'],
    },
    {
      title: 'Cards',
      colors: ['card', 'cardForeground'],
    },
    {
      title: 'Primary',
      colors: ['primary', 'primaryForeground'],
    },
    {
      title: 'Secondary',
      colors: ['secondary', 'secondaryForeground'],
    },
    {
      title: 'Muted',
      colors: ['muted', 'mutedForeground'],
    },
    {
      title: 'Accent & Border',
      colors: ['accent', 'border', 'ring'],
    },
  ];

  const updateColor = (key: string, value: string) => {
    onChange({
      ...theme,
      colors: {
        ...theme.colors as CustomTheme['colors'],
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Name & Description */}
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Theme Name</label>
          <input
            type="text"
            value={theme.name || ''}
            onChange={(e) => onChange({ ...theme, name: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="My Custom Theme"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Description (optional)</label>
          <input
            type="text"
            value={theme.description || ''}
            onChange={(e) => onChange({ ...theme, description: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
            placeholder="A brief description"
          />
        </div>
      </div>

      {/* Color Groups */}
      <div className="space-y-4">
        <h3 className="font-semibold">Colors</h3>
        {colorGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-2 text-sm text-muted-foreground">{group.title}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {group.colors.map((colorKey) => (
                <div key={colorKey} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(theme.colors as Record<string, string>)?.[colorKey] || '#000000'}
                    onChange={(e) => updateColor(colorKey, e.target.value)}
                    className="h-8 w-12 cursor-pointer rounded border border-border"
                  />
                  <span className="text-sm capitalize">
                    {colorKey.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <button
          onClick={onCancel}
          className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Save Theme
        </button>
      </div>
    </div>
  );
}

// Theme Creator Button
export function ThemeCreatorButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">Themes</span>
      </button>
      <ThemeCreator isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
