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
}

const HISTORY_KEY = 'qr-generator-history';
const MAX_HISTORY = 10;

export function saveToHistory(item: Omit<QRHistoryItem, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  try {
    const history = getHistory();
    const newItem: QRHistoryItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: Date.now(),
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
