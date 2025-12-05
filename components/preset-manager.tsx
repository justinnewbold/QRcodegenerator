'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  QRPreset,
  getAllPresets,
  getUserPresets,
  savePreset,
  deletePreset,
  duplicatePreset,
  getFavorites,
  addFavorite,
  removeFavorite,
  isFavorite,
  exportPresetAsJson,
  importPresetFromJson,
  getCategories,
  searchPresets,
} from '@/lib/preset-manager';
import {
  Layers,
  X,
  Plus,
  Search,
  Star,
  Download,
  Upload,
  Copy,
  Trash2,
  Check,
  Filter,
  Grid,
  List,
  Share2,
} from 'lucide-react';

interface PresetManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (preset: QRPreset) => void;
  currentSettings?: Partial<QRPreset>;
}

export function PresetManager({
  isOpen,
  onClose,
  onApply,
  currentSettings,
}: PresetManagerProps) {
  const [presets, setPresets] = useState<QRPreset[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all' | 'favorites'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [showSaveModal, setShowSaveModal] = useState(false);

  // Load presets and favorites
  useEffect(() => {
    if (isOpen) {
      setPresets(getAllPresets());
      setFavorites(getFavorites());
    }
  }, [isOpen]);

  // Get categories
  const categories = useMemo(() => getCategories(), [presets]);

  // Filter presets
  const filteredPresets = useMemo(() => {
    let result = searchQuery ? searchPresets(searchQuery) : presets;

    if (selectedCategory === 'favorites') {
      result = result.filter(p => favorites.includes(p.id));
    } else if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    return result;
  }, [presets, searchQuery, selectedCategory, favorites]);

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    if (isFavorite(id)) {
      removeFavorite(id);
      setFavorites(prev => prev.filter(f => f !== id));
    } else {
      addFavorite(id);
      setFavorites(prev => [...prev, id]);
    }
  };

  // Delete preset
  const handleDelete = (id: string) => {
    if (confirm('Delete this preset?')) {
      deletePreset(id);
      setPresets(getAllPresets());
    }
  };

  // Duplicate preset
  const handleDuplicate = (id: string) => {
    duplicatePreset(id);
    setPresets(getAllPresets());
  };

  // Export preset
  const handleExport = (id: string) => {
    const json = exportPresetAsJson(id);
    if (json) {
      const preset = presets.find(p => p.id === id);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `preset-${preset?.name.toLowerCase().replace(/\s+/g, '-') || id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Import preset
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const preset = importPresetFromJson(content);
      if (preset) {
        setPresets(getAllPresets());
        setImportError(null);
      } else {
        setImportError('Invalid preset file');
        setTimeout(() => setImportError(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Share preset
  const handleShare = async (id: string) => {
    const preset = presets.find(p => p.id === id);
    if (!preset) return;

    const json = exportPresetAsJson(id);
    if (json) {
      const encoded = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const url = `${window.location.origin}/?preset=${encoded.slice(0, 100)}`;
      await navigator.clipboard.writeText(url);
      setCopiedUrl(id);
      setTimeout(() => setCopiedUrl(null), 2000);
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSaveModal) {
          setShowSaveModal(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, showSaveModal, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Layers className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">QR Presets</h2>
              <p className="text-sm text-muted-foreground">
                {presets.length} presets available
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
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
            {currentSettings && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <Plus className="h-4 w-4" />
                Save Current
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border p-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search presets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            <CategoryButton
              active={selectedCategory === 'all'}
              onClick={() => setSelectedCategory('all')}
            >
              All
            </CategoryButton>
            <CategoryButton
              active={selectedCategory === 'favorites'}
              onClick={() => setSelectedCategory('favorites')}
              icon={<Star className="h-3.5 w-3.5" />}
            >
              Favorites
            </CategoryButton>
            {categories.map(cat => (
              <CategoryButton
                key={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </CategoryButton>
            ))}
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-border p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`rounded p-1.5 ${viewMode === 'grid' ? 'bg-muted' : ''}`}
              title="Grid view"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`rounded p-1.5 ${viewMode === 'list' ? 'bg-muted' : ''}`}
              title="List view"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredPresets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Layers className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">No presets found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {searchQuery ? 'Try a different search term' : 'Create your first preset!'}
              </p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredPresets.map((preset) => (
                <PresetCard
                  key={preset.id}
                  preset={preset}
                  isFavorite={favorites.includes(preset.id)}
                  onApply={onApply ? () => { onApply(preset); onClose(); } : undefined}
                  onFavorite={() => toggleFavorite(preset.id)}
                  onDuplicate={() => handleDuplicate(preset.id)}
                  onExport={() => handleExport(preset.id)}
                  onShare={() => handleShare(preset.id)}
                  onDelete={preset.isBuiltIn ? undefined : () => handleDelete(preset.id)}
                  copiedUrl={copiedUrl === preset.id}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredPresets.map((preset) => (
                <PresetListItem
                  key={preset.id}
                  preset={preset}
                  isFavorite={favorites.includes(preset.id)}
                  onApply={onApply ? () => { onApply(preset); onClose(); } : undefined}
                  onFavorite={() => toggleFavorite(preset.id)}
                  onExport={() => handleExport(preset.id)}
                  onDelete={preset.isBuiltIn ? undefined : () => handleDelete(preset.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Import error */}
        {importError && (
          <div className="absolute bottom-4 left-4 right-4 rounded-lg bg-red-500/10 px-4 py-2 text-center text-sm text-red-500">
            {importError}
          </div>
        )}

        {/* Save Modal */}
        {showSaveModal && currentSettings && (
          <SavePresetModal
            currentSettings={currentSettings}
            onSave={(name, description) => {
              savePreset({
                name,
                description,
                type: currentSettings.type || 'url',
                size: currentSettings.size || 300,
                errorCorrection: currentSettings.errorCorrection || 'M',
                margin: currentSettings.margin ?? 4,
                foregroundColor: currentSettings.foregroundColor || '#000000',
                backgroundColor: currentSettings.backgroundColor || '#ffffff',
                dotStyle: currentSettings.dotStyle || 'squares',
                cornerStyle: currentSettings.cornerStyle || 'square',
                gradient: currentSettings.gradient,
                frame: currentSettings.frame,
                eyeColors: currentSettings.eyeColors,
              });
              setPresets(getAllPresets());
              setShowSaveModal(false);
            }}
            onClose={() => setShowSaveModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// Category Button
function CategoryButton({
  children,
  active,
  onClick,
  icon,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors ${
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

// Preset Card
function PresetCard({
  preset,
  isFavorite,
  onApply,
  onFavorite,
  onDuplicate,
  onExport,
  onShare,
  onDelete,
  copiedUrl,
}: {
  preset: QRPreset;
  isFavorite: boolean;
  onApply?: () => void;
  onFavorite: () => void;
  onDuplicate: () => void;
  onExport: () => void;
  onShare: () => void;
  onDelete?: () => void;
  copiedUrl: boolean;
}) {
  return (
    <div className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-lg">
      {/* Preview */}
      <div
        className="flex h-28 items-center justify-center p-4"
        style={{ backgroundColor: preset.backgroundColor }}
      >
        <div
          className="h-20 w-20 rounded-lg"
          style={{
            backgroundColor: preset.foregroundColor,
            borderRadius: preset.dotStyle === 'dots' ? '50%' :
                         preset.dotStyle === 'rounded' ? '8px' :
                         preset.dotStyle === 'extra-rounded' ? '12px' : '4px',
            background: preset.gradient?.enabled
              ? `linear-gradient(${preset.gradient.rotation || 45}deg, ${preset.gradient.colors.join(', ')})`
              : preset.foregroundColor,
          }}
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate font-semibold">{preset.name}</h3>
              {preset.isBuiltIn && (
                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  Built-in
                </span>
              )}
            </div>
            {preset.description && (
              <p className="mt-0.5 truncate text-sm text-muted-foreground">
                {preset.description}
              </p>
            )}
          </div>
          <button
            onClick={onFavorite}
            className="shrink-0 rounded-lg p-1 text-muted-foreground hover:text-yellow-500"
          >
            <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          </button>
        </div>

        {/* Tags */}
        {preset.tags && preset.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {preset.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="mt-3 flex gap-2">
          {onApply && (
            <button
              onClick={onApply}
              className="flex-1 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Apply
            </button>
          )}
          <button
            onClick={onDuplicate}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Duplicate"
          >
            <Copy className="h-4 w-4" />
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
            title={copiedUrl ? 'Copied!' : 'Share'}
          >
            {copiedUrl ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
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

// Preset List Item
function PresetListItem({
  preset,
  isFavorite,
  onApply,
  onFavorite,
  onExport,
  onDelete,
}: {
  preset: QRPreset;
  isFavorite: boolean;
  onApply?: () => void;
  onFavorite: () => void;
  onExport: () => void;
  onDelete?: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/30">
      {/* Color preview */}
      <div
        className="h-12 w-12 shrink-0 rounded-lg"
        style={{
          backgroundColor: preset.backgroundColor,
          border: `3px solid ${preset.foregroundColor}`,
        }}
      />

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{preset.name}</h3>
          {preset.isBuiltIn && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              Built-in
            </span>
          )}
        </div>
        {preset.description && (
          <p className="truncate text-sm text-muted-foreground">{preset.description}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onFavorite}
          className="rounded-lg p-1.5 text-muted-foreground hover:text-yellow-500"
        >
          <Star className={`h-4 w-4 ${isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
        </button>
        {onApply && (
          <button
            onClick={onApply}
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Apply
          </button>
        )}
        <button
          onClick={onExport}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <Download className="h-4 w-4" />
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// Save Preset Modal
function SavePresetModal({
  currentSettings,
  onSave,
  onClose,
}: {
  currentSettings: Partial<QRPreset>;
  onSave: (name: string, description: string) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState('My Preset');
  const [description, setDescription] = useState('');

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
        <h3 className="mb-4 text-lg font-semibold">Save as Preset</h3>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
              placeholder="My Custom Preset"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description (optional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
              placeholder="A brief description"
            />
          </div>

          {/* Preview */}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="mb-2 text-sm font-medium">Preview</p>
            <div className="flex items-center gap-3">
              <div
                className="h-12 w-12 rounded-lg"
                style={{
                  backgroundColor: currentSettings.backgroundColor || '#ffffff',
                  border: `3px solid ${currentSettings.foregroundColor || '#000000'}`,
                }}
              />
              <div className="text-sm">
                <p>Size: {currentSettings.size}px</p>
                <p>Style: {currentSettings.dotStyle}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(name, description)}
            disabled={!name.trim()}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Save Preset
          </button>
        </div>
      </div>
    </div>
  );
}

// Preset Manager Button
export function PresetManagerButton({ onApply, currentSettings }: {
  onApply?: (preset: QRPreset) => void;
  currentSettings?: Partial<QRPreset>;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Layers className="h-4 w-4" />
        <span className="hidden sm:inline">Presets</span>
      </button>
      <PresetManager
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onApply={onApply}
        currentSettings={currentSettings}
      />
    </>
  );
}
