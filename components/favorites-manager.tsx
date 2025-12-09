'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  getFavorites,
  isFavorite,
  toggleFavorite,
  getFavoriteQRCodes,
  getAllTags,
  createTag,
  updateTag,
  deleteTag,
  getQRTags,
  addTagToQR,
  removeTagFromQR,
  getQRCodesByTag,
  filterByTags,
  duplicateQRCode,
  bulkDuplicateQRCodes,
  TAG_COLORS,
  QRTag,
} from '@/lib/qr-favorites';
import {
  Star,
  X,
  Tag,
  Plus,
  Copy,
  Trash2,
  Edit2,
  Check,
  Filter,
  Search,
  ChevronDown,
  Palette,
} from 'lucide-react';

interface FavoritesManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectQR?: (qrId: string) => void;
}

export function FavoritesManager({
  isOpen,
  onClose,
  onSelectQR,
}: FavoritesManagerProps) {
  const [activeTab, setActiveTab] = useState<'favorites' | 'tags'>('favorites');
  const [favoriteQRs, setFavoriteQRs] = useState<unknown[]>([]);
  const [tags, setTags] = useState<QRTag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[10]);
  const [showNewTagForm, setShowNewTagForm] = useState(false);
  const [selectedQRs, setSelectedQRs] = useState<Set<string>>(new Set());

  // Load data
  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Listen for updates
  useEffect(() => {
    const handleUpdate = () => loadData();
    window.addEventListener('qr-favorites-updated', handleUpdate);
    window.addEventListener('qr-tags-updated', handleUpdate);
    window.addEventListener('qr-history-updated', handleUpdate);
    return () => {
      window.removeEventListener('qr-favorites-updated', handleUpdate);
      window.removeEventListener('qr-tags-updated', handleUpdate);
      window.removeEventListener('qr-history-updated', handleUpdate);
    };
  }, []);

  const loadData = () => {
    setFavoriteQRs(getFavoriteQRCodes());
    setTags(getAllTags());
  };

  // Filter favorites by search and tags
  const filteredFavorites = useMemo(() => {
    let filtered = favoriteQRs as { id: string; name?: string; content?: string; tags?: string[] }[];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(qr =>
        qr.name?.toLowerCase().includes(query) ||
        qr.content?.toLowerCase().includes(query)
      );
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(qr =>
        selectedTags.every(tagId => qr.tags?.includes(tagId))
      );
    }

    return filtered;
  }, [favoriteQRs, searchQuery, selectedTags]);

  // Handle tag toggle on filter
  const toggleTagFilter = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  // Handle create tag
  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    createTag(newTagName.trim(), newTagColor);
    setNewTagName('');
    setShowNewTagForm(false);
    loadData();
  };

  // Handle update tag
  const handleUpdateTag = (tagId: string, name: string, color: string) => {
    updateTag(tagId, { name, color });
    setEditingTag(null);
    loadData();
  };

  // Handle delete tag
  const handleDeleteTag = (tagId: string) => {
    if (confirm('Delete this tag? It will be removed from all QR codes.')) {
      deleteTag(tagId);
      setSelectedTags(prev => prev.filter(t => t !== tagId));
      loadData();
    }
  };

  // Handle duplicate
  const handleDuplicate = (qrId: string) => {
    duplicateQRCode(qrId);
    loadData();
  };

  // Handle bulk duplicate
  const handleBulkDuplicate = () => {
    if (selectedQRs.size === 0) return;
    bulkDuplicateQRCodes(Array.from(selectedQRs));
    setSelectedQRs(new Set());
    loadData();
  };

  // Toggle QR selection
  const toggleQRSelection = (qrId: string) => {
    setSelectedQRs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(qrId)) {
        newSet.delete(qrId);
      } else {
        newSet.add(qrId);
      }
      return newSet;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10">
              <Star className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Favorites & Tags</h2>
              <p className="text-sm text-muted-foreground">
                Manage your favorite QR codes and organize with tags
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

        {/* Tabs */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('favorites')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'favorites'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Star className="h-4 w-4" />
              Favorites ({favoriteQRs.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('tags')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'tags'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span className="flex items-center justify-center gap-2">
              <Tag className="h-4 w-4" />
              Tags ({tags.length})
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'favorites' ? (
            <div className="p-4">
              {/* Search and Filter */}
              <div className="mb-4 space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search favorites..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background py-2 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Tag filters */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Filter className="h-4 w-4" />
                      Filter:
                    </span>
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        onClick={() => toggleTagFilter(tag.id)}
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                          selectedTags.includes(tag.id)
                            ? 'ring-2 ring-primary ring-offset-1'
                            : ''
                        }`}
                        style={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                        }}
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Bulk actions */}
                {selectedQRs.size > 0 && (
                  <div className="flex items-center gap-2 rounded-lg bg-muted p-2">
                    <span className="text-sm">{selectedQRs.size} selected</span>
                    <button
                      onClick={handleBulkDuplicate}
                      className="flex items-center gap-1 rounded px-2 py-1 text-sm hover:bg-background"
                    >
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </button>
                    <button
                      onClick={() => setSelectedQRs(new Set())}
                      className="ml-auto text-sm text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              {/* Favorites list */}
              {filteredFavorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Star className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    {favoriteQRs.length === 0
                      ? 'No favorites yet. Star QR codes to add them here.'
                      : 'No favorites match your filters.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredFavorites.map((qr) => (
                    <FavoriteQRItem
                      key={qr.id}
                      qr={qr}
                      tags={tags}
                      isSelected={selectedQRs.has(qr.id)}
                      onToggleSelect={() => toggleQRSelection(qr.id)}
                      onSelect={() => onSelectQR?.(qr.id)}
                      onDuplicate={() => handleDuplicate(qr.id)}
                      onToggleFavorite={() => {
                        toggleFavorite(qr.id);
                        loadData();
                      }}
                      onTagChange={() => loadData()}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4">
              {/* Create tag button */}
              <div className="mb-4">
                {showNewTagForm ? (
                  <div className="rounded-lg border border-border p-3">
                    <input
                      type="text"
                      placeholder="Tag name..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      autoFocus
                    />
                    <div className="mb-3 flex flex-wrap gap-2">
                      {TAG_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setNewTagColor(color)}
                          className={`h-6 w-6 rounded-full ${
                            newTagColor === color ? 'ring-2 ring-primary ring-offset-2' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateTag}
                        className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
                      >
                        <Check className="h-4 w-4" />
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setShowNewTagForm(false);
                          setNewTagName('');
                        }}
                        className="rounded-lg px-3 py-1.5 text-sm hover:bg-muted"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowNewTagForm(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-sm text-muted-foreground hover:border-primary hover:text-foreground"
                  >
                    <Plus className="h-4 w-4" />
                    Create New Tag
                  </button>
                )}
              </div>

              {/* Tags list */}
              {tags.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Tag className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No tags yet. Create tags to organize your QR codes.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tags.map((tag) => (
                    <TagItem
                      key={tag.id}
                      tag={tag}
                      isEditing={editingTag === tag.id}
                      onEdit={() => setEditingTag(tag.id)}
                      onSave={(name, color) => handleUpdateTag(tag.id, name, color)}
                      onCancel={() => setEditingTag(null)}
                      onDelete={() => handleDeleteTag(tag.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Favorite QR Item Component
function FavoriteQRItem({
  qr,
  tags,
  isSelected,
  onToggleSelect,
  onSelect,
  onDuplicate,
  onToggleFavorite,
  onTagChange,
}: {
  qr: { id: string; name?: string; content?: string; type?: string; tags?: string[] };
  tags: QRTag[];
  isSelected: boolean;
  onToggleSelect: () => void;
  onSelect: () => void;
  onDuplicate: () => void;
  onToggleFavorite: () => void;
  onTagChange: () => void;
}) {
  const [showTagMenu, setShowTagMenu] = useState(false);
  const qrTags = tags.filter(t => qr.tags?.includes(t.id));

  return (
    <div className="group flex items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={onToggleSelect}
        className="h-4 w-4 rounded border-input"
      />

      <div className="flex-1 min-w-0" onClick={onSelect}>
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">
            {qr.name || `${qr.type || 'QR'} Code`}
          </span>
          {qrTags.length > 0 && (
            <div className="flex gap-1">
              {qrTags.slice(0, 3).map((tag) => (
                <span
                  key={tag.id}
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: tag.color }}
                  title={tag.name}
                />
              ))}
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {qr.content?.slice(0, 50)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <div className="relative">
          <button
            onClick={() => setShowTagMenu(!showTagMenu)}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Manage tags"
          >
            <Tag className="h-4 w-4" />
          </button>

          {showTagMenu && (
            <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-border bg-card p-2 shadow-lg">
              {tags.length === 0 ? (
                <p className="px-2 py-1 text-sm text-muted-foreground">No tags available</p>
              ) : (
                tags.map((tag) => {
                  const isAssigned = qr.tags?.includes(tag.id);
                  return (
                    <button
                      key={tag.id}
                      onClick={() => {
                        if (isAssigned) {
                          removeTagFromQR(qr.id, tag.id);
                        } else {
                          addTagToQR(qr.id, tag.id);
                        }
                        onTagChange();
                      }}
                      className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted"
                    >
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="flex-1 text-left">{tag.name}</span>
                      {isAssigned && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <button
          onClick={onDuplicate}
          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Duplicate"
        >
          <Copy className="h-4 w-4" />
        </button>

        <button
          onClick={onToggleFavorite}
          className="rounded p-1.5 text-yellow-500 hover:bg-muted"
          title="Remove from favorites"
        >
          <Star className="h-4 w-4 fill-current" />
        </button>
      </div>
    </div>
  );
}

// Tag Item Component
function TagItem({
  tag,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  onDelete,
}: {
  tag: QRTag;
  isEditing: boolean;
  onEdit: () => void;
  onSave: (name: string, color: string) => void;
  onCancel: () => void;
  onDelete: () => void;
}) {
  const [name, setName] = useState(tag.name);
  const [color, setColor] = useState(tag.color);
  const [showColors, setShowColors] = useState(false);

  const qrCount = getQRCodesByTag(tag.id).length;

  if (isEditing) {
    return (
      <div className="rounded-lg border border-border p-3">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mb-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          autoFocus
        />
        <div className="mb-3">
          <button
            onClick={() => setShowColors(!showColors)}
            className="flex items-center gap-2 text-sm"
          >
            <span
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: color }}
            />
            <span>Change color</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showColors ? 'rotate-180' : ''}`} />
          </button>
          {showColors && (
            <div className="mt-2 flex flex-wrap gap-2">
              {TAG_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-6 w-6 rounded-full ${
                    color === c ? 'ring-2 ring-primary ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onSave(name, color)}
            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <Check className="h-4 w-4" />
            Save
          </button>
          <button
            onClick={onCancel}
            className="rounded-lg px-3 py-1.5 text-sm hover:bg-muted"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <span
          className="h-4 w-4 rounded-full"
          style={{ backgroundColor: tag.color }}
        />
        <div>
          <span className="font-medium">{tag.name}</span>
          <span className="ml-2 text-sm text-muted-foreground">
            {qrCount} QR code{qrCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        <button
          onClick={onEdit}
          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          title="Edit"
        >
          <Edit2 className="h-4 w-4" />
        </button>
        <button
          onClick={onDelete}
          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-red-500"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
