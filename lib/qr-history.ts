export interface QRHistoryItem {
  id: string;
  timestamp: number;
  type: string;
  content: string;
  preview: string;
  options: {
    errorLevel: string;
    size: number;
    fgColor: string;
    bgColor: string;
    margin: number;
    style?: string;
  };
  tags?: string[];
  favorite?: boolean;
  name?: string;
  notes?: string;
}

const HISTORY_KEY = 'qr-generator-history';
const MAX_HISTORY = 100; // Increased from 10

export function saveToHistory(item: Omit<QRHistoryItem, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const timestamp = Date.now();
    // Use timestamp + random suffix to prevent ID collisions
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const newItem: QRHistoryItem = {
      ...item,
      id: `${timestamp}-${randomSuffix}`,
      timestamp,
    };

    // Add to beginning of array
    history.unshift(newItem);

    // Keep only last MAX_HISTORY items
    const trimmedHistory = history.slice(0, MAX_HISTORY);

    localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmedHistory));
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

export function getHistory(): QRHistoryItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (!stored) return [];

    return JSON.parse(stored) as QRHistoryItem[];
  } catch (error) {
    console.error('Error reading history:', error);
    return [];
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

export function deleteHistoryItem(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting history item:', error);
  }
}

// New enhanced features

export function toggleFavorite(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const updated = history.map(item =>
      item.id === id ? { ...item, favorite: !item.favorite } : item
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error toggling favorite:', error);
  }
}

export function updateHistoryItem(id: string, updates: Partial<QRHistoryItem>): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const updated = history.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating history item:', error);
  }
}

export function addTagToItem(id: string, tag: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const updated = history.map(item => {
      if (item.id === id) {
        const tags = item.tags || [];
        if (!tags.includes(tag)) {
          return { ...item, tags: [...tags, tag] };
        }
      }
      return item;
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error adding tag:', error);
  }
}

export function removeTagFromItem(id: string, tag: string): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const updated = history.map(item => {
      if (item.id === id && item.tags) {
        return { ...item, tags: item.tags.filter(t => t !== tag) };
      }
      return item;
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error removing tag:', error);
  }
}

export function searchHistory(query: string): QRHistoryItem[] {
  const history = getHistory();
  const lowerQuery = query.toLowerCase();

  return history.filter(item => {
    return (
      item.type.toLowerCase().includes(lowerQuery) ||
      item.content.toLowerCase().includes(lowerQuery) ||
      item.name?.toLowerCase().includes(lowerQuery) ||
      item.notes?.toLowerCase().includes(lowerQuery) ||
      item.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  });
}

export function filterHistory(filters: {
  type?: string;
  favorite?: boolean;
  tags?: string[];
  dateFrom?: number;
  dateTo?: number;
}): QRHistoryItem[] {
  let history = getHistory();

  if (filters.type) {
    history = history.filter(item => item.type === filters.type);
  }

  if (filters.favorite !== undefined) {
    history = history.filter(item => item.favorite === filters.favorite);
  }

  if (filters.tags && filters.tags.length > 0) {
    history = history.filter(item =>
      filters.tags!.some(tag => item.tags?.includes(tag))
    );
  }

  if (filters.dateFrom) {
    history = history.filter(item => item.timestamp >= filters.dateFrom!);
  }

  if (filters.dateTo) {
    history = history.filter(item => item.timestamp <= filters.dateTo!);
  }

  return history;
}

export function sortHistory(
  history: QRHistoryItem[],
  sortBy: 'date' | 'name' | 'type',
  order: 'asc' | 'desc' = 'desc'
): QRHistoryItem[] {
  const sorted = [...history].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date':
        comparison = a.timestamp - b.timestamp;
        break;
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '');
        break;
      case 'type':
        comparison = a.type.localeCompare(b.type);
        break;
    }

    return order === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

export function getAllTags(): string[] {
  const history = getHistory();
  const tagsSet = new Set<string>();

  history.forEach(item => {
    item.tags?.forEach(tag => tagsSet.add(tag));
  });

  return Array.from(tagsSet).sort();
}

export function bulkDeleteHistory(ids: string[]): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const filtered = history.filter(item => !ids.includes(item.id));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error bulk deleting history:', error);
  }
}

export function exportHistoryToCSV(): string {
  const history = getHistory();
  const headers = ['ID', 'Timestamp', 'Date', 'Type', 'Content', 'Name', 'Tags', 'Favorite', 'Notes'];

  const rows = history.map(item => [
    item.id,
    item.timestamp,
    new Date(item.timestamp).toISOString(),
    item.type,
    item.content.replace(/"/g, '""'), // Escape quotes
    item.name || '',
    (item.tags || []).join(';'),
    item.favorite ? 'Yes' : 'No',
    (item.notes || '').replace(/"/g, '""'),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
}

export function getHistoryStats() {
  const history = getHistory();

  const typeCount: Record<string, number> = {};
  let favoriteCount = 0;
  let taggedCount = 0;
  let namedCount = 0;

  history.forEach(item => {
    typeCount[item.type] = (typeCount[item.type] || 0) + 1;
    if (item.favorite) favoriteCount++;
    if (item.tags && item.tags.length > 0) taggedCount++;
    if (item.name) namedCount++;
  });

  const oldest = history.length > 0 ? Math.min(...history.map(h => h.timestamp)) : null;
  const newest = history.length > 0 ? Math.max(...history.map(h => h.timestamp)) : null;

  return {
    total: history.length,
    byType: typeCount,
    favorites: favoriteCount,
    tagged: taggedCount,
    named: namedCount,
    oldest,
    newest,
    allTags: getAllTags(),
  };
}

