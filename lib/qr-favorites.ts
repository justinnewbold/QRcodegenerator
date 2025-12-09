/**
 * QR Code Favorites, Tags, and Duplication System
 */

const FAVORITES_KEY = 'qr-favorites';
const TAGS_KEY = 'qr-tags';

export interface QRTag {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface QRFavorite {
  qrId: string;
  addedAt: string;
}

// ============================================
// Favorites System
// ============================================

/**
 * Get all favorites
 */
export function getFavorites(): QRFavorite[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Check if a QR code is favorited
 */
export function isFavorite(qrId: string): boolean {
  return getFavorites().some(f => f.qrId === qrId);
}

/**
 * Add to favorites
 */
export function addFavorite(qrId: string): void {
  if (typeof window === 'undefined') return;

  const favorites = getFavorites();
  if (!favorites.some(f => f.qrId === qrId)) {
    favorites.push({
      qrId,
      addedAt: new Date().toISOString(),
    });
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    window.dispatchEvent(new CustomEvent('qr-favorites-updated'));
  }
}

/**
 * Remove from favorites
 */
export function removeFavorite(qrId: string): void {
  if (typeof window === 'undefined') return;

  const favorites = getFavorites().filter(f => f.qrId !== qrId);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  window.dispatchEvent(new CustomEvent('qr-favorites-updated'));
}

/**
 * Toggle favorite status
 */
export function toggleFavorite(qrId: string): boolean {
  if (isFavorite(qrId)) {
    removeFavorite(qrId);
    return false;
  } else {
    addFavorite(qrId);
    return true;
  }
}

/**
 * Get favorited QR codes from history
 */
export function getFavoriteQRCodes(): unknown[] {
  if (typeof window === 'undefined') return [];

  try {
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    const favoriteIds = new Set(getFavorites().map(f => f.qrId));
    return history.filter((qr: { id: string }) => favoriteIds.has(qr.id));
  } catch {
    return [];
  }
}

// ============================================
// Tags System
// ============================================

/**
 * Get all tags
 */
export function getAllTags(): QRTag[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(TAGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Create a new tag
 */
export function createTag(name: string, color: string = '#3B82F6'): QRTag {
  const tags = getAllTags();

  const newTag: QRTag = {
    id: `tag-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    color,
    createdAt: new Date().toISOString(),
  };

  tags.push(newTag);
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  window.dispatchEvent(new CustomEvent('qr-tags-updated'));

  return newTag;
}

/**
 * Update a tag
 */
export function updateTag(tagId: string, updates: Partial<Pick<QRTag, 'name' | 'color'>>): QRTag | null {
  const tags = getAllTags();
  const index = tags.findIndex(t => t.id === tagId);

  if (index === -1) return null;

  tags[index] = { ...tags[index], ...updates };
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));
  window.dispatchEvent(new CustomEvent('qr-tags-updated'));

  return tags[index];
}

/**
 * Delete a tag
 */
export function deleteTag(tagId: string): void {
  if (typeof window === 'undefined') return;

  // Remove tag from list
  const tags = getAllTags().filter(t => t.id !== tagId);
  localStorage.setItem(TAGS_KEY, JSON.stringify(tags));

  // Remove tag from all QR codes
  try {
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    const updatedHistory = history.map((qr: { tags?: string[] }) => {
      if (qr.tags) {
        qr.tags = qr.tags.filter((t: string) => t !== tagId);
      }
      return qr;
    });
    localStorage.setItem('qr-history', JSON.stringify(updatedHistory));
  } catch {
    // Ignore errors
  }

  window.dispatchEvent(new CustomEvent('qr-tags-updated'));
}

/**
 * Get tags for a specific QR code
 */
export function getQRTags(qrId: string): QRTag[] {
  if (typeof window === 'undefined') return [];

  try {
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    const qr = history.find((q: { id: string }) => q.id === qrId);

    if (!qr || !qr.tags) return [];

    const allTags = getAllTags();
    return allTags.filter(t => qr.tags.includes(t.id));
  } catch {
    return [];
  }
}

/**
 * Add tag to QR code
 */
export function addTagToQR(qrId: string, tagId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    const index = history.findIndex((qr: { id: string }) => qr.id === qrId);

    if (index === -1) return;

    if (!history[index].tags) {
      history[index].tags = [];
    }

    if (!history[index].tags.includes(tagId)) {
      history[index].tags.push(tagId);
      localStorage.setItem('qr-history', JSON.stringify(history));
      window.dispatchEvent(new CustomEvent('qr-history-updated'));
    }
  } catch {
    // Ignore errors
  }
}

/**
 * Remove tag from QR code
 */
export function removeTagFromQR(qrId: string, tagId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    const index = history.findIndex((qr: { id: string }) => qr.id === qrId);

    if (index === -1 || !history[index].tags) return;

    history[index].tags = history[index].tags.filter((t: string) => t !== tagId);
    localStorage.setItem('qr-history', JSON.stringify(history));
    window.dispatchEvent(new CustomEvent('qr-history-updated'));
  } catch {
    // Ignore errors
  }
}

/**
 * Get QR codes by tag
 */
export function getQRCodesByTag(tagId: string): unknown[] {
  if (typeof window === 'undefined') return [];

  try {
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    return history.filter((qr: { tags?: string[] }) => qr.tags?.includes(tagId));
  } catch {
    return [];
  }
}

/**
 * Filter QR codes by multiple tags (AND logic)
 */
export function filterByTags(tagIds: string[]): unknown[] {
  if (typeof window === 'undefined' || tagIds.length === 0) return [];

  try {
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    return history.filter((qr: { tags?: string[] }) =>
      tagIds.every(tagId => qr.tags?.includes(tagId))
    );
  } catch {
    return [];
  }
}

// ============================================
// Duplication System
// ============================================

/**
 * Duplicate a QR code
 */
export function duplicateQRCode(qrId: string, newName?: string): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    const original = history.find((qr: { id: string }) => qr.id === qrId);

    if (!original) return null;

    // Create duplicate with new ID and name
    const duplicate = {
      ...original,
      id: `qr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: newName || `Copy of ${original.name || 'QR Code'}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Don't copy tags or favorites - start fresh
      tags: [],
    };

    history.unshift(duplicate);
    localStorage.setItem('qr-history', JSON.stringify(history));
    window.dispatchEvent(new CustomEvent('qr-history-updated'));

    return duplicate.id;
  } catch {
    return null;
  }
}

/**
 * Bulk duplicate QR codes
 */
export function bulkDuplicateQRCodes(qrIds: string[]): string[] {
  const newIds: string[] = [];

  qrIds.forEach(id => {
    const newId = duplicateQRCode(id);
    if (newId) newIds.push(newId);
  });

  return newIds;
}

// ============================================
// Preset tag colors
// ============================================

export const TAG_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#F59E0B', // Amber
  '#EAB308', // Yellow
  '#84CC16', // Lime
  '#22C55E', // Green
  '#10B981', // Emerald
  '#14B8A6', // Teal
  '#06B6D4', // Cyan
  '#0EA5E9', // Sky
  '#3B82F6', // Blue
  '#6366F1', // Indigo
  '#8B5CF6', // Violet
  '#A855F7', // Purple
  '#D946EF', // Fuchsia
  '#EC4899', // Pink
  '#F43F5E', // Rose
  '#64748B', // Slate
];
