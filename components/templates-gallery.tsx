'use client';

import { useState, useMemo } from 'react';
import {
  QRTemplate,
  TemplateCategory,
  TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
  searchTemplates,
  getPopularTemplates,
  applyTemplate,
} from '@/lib/qr-templates-gallery';
import {
  LayoutTemplate,
  X,
  Search,
  Star,
  Sparkles,
  ChevronRight,
  Check,
  Filter,
  Grid,
  Utensils,
  Briefcase,
  Calendar,
  ShoppingBag,
  Share2,
  GraduationCap,
  Heart,
  Home,
  Minimize2,
  Palette,
} from 'lucide-react';

interface TemplatesGalleryProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: (settings: ReturnType<typeof applyTemplate>) => void;
}

export function TemplatesGallery({
  isOpen,
  onClose,
  onApply,
}: TemplatesGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all' | 'popular'>('popular');
  const [previewTemplate, setPreviewTemplate] = useState<QRTemplate | null>(null);

  // Get templates based on selection
  const templates = useMemo(() => {
    if (searchQuery) {
      return searchTemplates(searchQuery);
    }
    if (selectedCategory === 'popular') {
      return getPopularTemplates(12);
    }
    if (selectedCategory === 'all') {
      return Object.values(TEMPLATE_CATEGORIES).flatMap(cat =>
        getTemplatesByCategory(cat.id as TemplateCategory)
      );
    }
    return getTemplatesByCategory(selectedCategory);
  }, [searchQuery, selectedCategory]);

  // Category icons
  const categoryIcons: Record<string, typeof LayoutTemplate> = {
    restaurant: Utensils,
    business: Briefcase,
    event: Calendar,
    retail: ShoppingBag,
    social: Share2,
    education: GraduationCap,
    healthcare: Heart,
    realestate: Home,
    minimal: Minimize2,
    creative: Palette,
  };

  // Handle apply template
  const handleApply = (template: QRTemplate) => {
    const settings = applyTemplate(template.id);
    if (settings && onApply) {
      onApply(settings);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <LayoutTemplate className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Templates Gallery</h2>
              <p className="text-sm text-muted-foreground">
                Pre-designed QR code templates for every use case
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-4 border-b border-border p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto border-b border-border p-4">
          <button
            onClick={() => setSelectedCategory('popular')}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
              selectedCategory === 'popular'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            Popular
          </button>
          <button
            onClick={() => setSelectedCategory('all')}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            <Filter className="h-4 w-4" />
            All
          </button>
          {Object.values(TEMPLATE_CATEGORIES).map((cat) => {
            const Icon = categoryIcons[cat.id] || Grid;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as TemplateCategory)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm ${
                  selectedCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <LayoutTemplate className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No templates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onPreview={() => setPreviewTemplate(template)}
                  onApply={() => handleApply(template)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {previewTemplate && (
          <TemplatePreview
            template={previewTemplate}
            onClose={() => setPreviewTemplate(null)}
            onApply={() => {
              handleApply(previewTemplate);
              setPreviewTemplate(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

// Template Card Component
function TemplateCard({
  template,
  onPreview,
  onApply,
}: {
  template: QRTemplate;
  onPreview: () => void;
  onApply: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-card transition-all hover:border-primary hover:shadow-lg">
      {/* Thumbnail */}
      <div
        className="aspect-square"
        style={{
          background: template.settings.gradient?.enabled
            ? `linear-gradient(${template.settings.gradient.rotation || 0}deg, ${template.settings.gradient.colors.join(', ')})`
            : template.settings.backgroundColor,
        }}
      >
        <div className="flex h-full items-center justify-center p-4">
          {/* QR Preview placeholder */}
          <div
            className="h-16 w-16 rounded-lg"
            style={{
              backgroundColor: template.settings.foregroundColor,
              opacity: 0.8,
            }}
          />
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="font-medium text-sm truncate">{template.name}</h3>
        <p className="text-xs text-muted-foreground truncate">{template.description}</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {template.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hover Actions */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onPreview}
          className="rounded-lg bg-white/20 px-3 py-1.5 text-sm text-white backdrop-blur-sm hover:bg-white/30"
        >
          Preview
        </button>
        <button
          onClick={onApply}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
        >
          Apply
        </button>
      </div>

      {/* Popularity indicator */}
      {template.popularity > 80 && (
        <div className="absolute right-2 top-2">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        </div>
      )}
    </div>
  );
}

// Template Preview Component
function TemplatePreview({
  template,
  onClose,
  onApply,
}: {
  template: QRTemplate;
  onClose: () => void;
  onApply: () => void;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">{template.name}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Large Preview */}
        <div
          className="mb-4 aspect-square rounded-lg"
          style={{
            background: template.settings.gradient?.enabled
              ? `linear-gradient(${template.settings.gradient.rotation || 0}deg, ${template.settings.gradient.colors.join(', ')})`
              : template.settings.backgroundColor,
          }}
        >
          <div className="flex h-full items-center justify-center p-8">
            <div
              className="h-32 w-32 rounded-xl"
              style={{
                backgroundColor: template.settings.foregroundColor,
                opacity: 0.9,
              }}
            />
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground">{template.description}</p>

        {/* Settings Preview */}
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-muted p-2">
            <span className="text-muted-foreground">Dot Style:</span>{' '}
            <span className="capitalize">{template.settings.dotStyle}</span>
          </div>
          <div className="rounded-lg bg-muted p-2">
            <span className="text-muted-foreground">Corner:</span>{' '}
            <span className="capitalize">{template.settings.cornerStyle}</span>
          </div>
          {template.settings.frameStyle && (
            <div className="rounded-lg bg-muted p-2">
              <span className="text-muted-foreground">Frame:</span>{' '}
              <span className="capitalize">{template.settings.frameStyle}</span>
            </div>
          )}
          <div className="rounded-lg bg-muted p-2">
            <span className="text-muted-foreground">Error:</span>{' '}
            <span>{template.settings.errorCorrection}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1">
          {template.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
          >
            Cancel
          </button>
          <button
            onClick={onApply}
            className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <span className="flex items-center justify-center gap-2">
              <Check className="h-4 w-4" />
              Apply Template
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
