/**
 * Offline Sync System
 * Queue operations when offline and sync when back online
 */

export interface QueuedOperation {
  id: string;
  type: 'analytics' | 'webhook' | 'sync';
  payload: unknown;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

const QUEUE_STORAGE_KEY = 'offline-operation-queue';
const MAX_QUEUE_SIZE = 100;
const MAX_RETRIES = 3;

/**
 * Check if we're online
 */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/**
 * Get queued operations
 */
export function getQueue(): QueuedOperation[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save queue
 */
function saveQueue(queue: QueuedOperation[]): void {
  if (typeof window === 'undefined') return;

  try {
    // Keep only recent operations to prevent storage overflow
    const trimmedQueue = queue.slice(-MAX_QUEUE_SIZE);
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(trimmedQueue));
  } catch {
    // Storage full, clear old items
    try {
      const minimalQueue = queue.slice(-10);
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(minimalQueue));
    } catch {
      // Give up
    }
  }
}

/**
 * Add operation to queue
 */
export function queueOperation(
  type: QueuedOperation['type'],
  payload: unknown
): QueuedOperation {
  const operation: QueuedOperation = {
    id: `op-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    payload,
    timestamp: Date.now(),
    retries: 0,
    maxRetries: MAX_RETRIES,
  };

  const queue = getQueue();
  queue.push(operation);
  saveQueue(queue);

  return operation;
}

/**
 * Remove operation from queue
 */
export function removeFromQueue(id: string): void {
  const queue = getQueue();
  const filtered = queue.filter(op => op.id !== id);
  saveQueue(filtered);
}

/**
 * Mark operation as failed (increment retries)
 */
export function markOperationFailed(id: string): boolean {
  const queue = getQueue();
  const index = queue.findIndex(op => op.id === id);

  if (index === -1) return false;

  queue[index].retries++;

  if (queue[index].retries >= queue[index].maxRetries) {
    // Remove if max retries exceeded
    queue.splice(index, 1);
    saveQueue(queue);
    return false;
  }

  saveQueue(queue);
  return true;
}

/**
 * Process a single operation
 */
async function processOperation(
  operation: QueuedOperation,
  handlers: OperationHandlers
): Promise<boolean> {
  try {
    switch (operation.type) {
      case 'analytics':
        if (handlers.analytics) {
          await handlers.analytics(operation.payload);
        }
        break;
      case 'webhook':
        if (handlers.webhook) {
          await handlers.webhook(operation.payload);
        }
        break;
      case 'sync':
        if (handlers.sync) {
          await handlers.sync(operation.payload);
        }
        break;
    }

    removeFromQueue(operation.id);
    return true;
  } catch (error) {
    const shouldRetry = markOperationFailed(operation.id);
    console.warn(`Operation ${operation.id} failed:`, error, shouldRetry ? 'Will retry' : 'Max retries exceeded');
    return false;
  }
}

export interface OperationHandlers {
  analytics?: (payload: unknown) => Promise<void>;
  webhook?: (payload: unknown) => Promise<void>;
  sync?: (payload: unknown) => Promise<void>;
}

/**
 * Process all queued operations
 */
export async function processQueue(handlers: OperationHandlers): Promise<{
  processed: number;
  failed: number;
}> {
  if (!isOnline()) {
    return { processed: 0, failed: 0 };
  }

  const queue = getQueue();
  let processed = 0;
  let failed = 0;

  for (const operation of queue) {
    const success = await processOperation(operation, handlers);
    if (success) {
      processed++;
    } else {
      failed++;
    }
  }

  return { processed, failed };
}

/**
 * Start online/offline listener
 */
export function initOfflineSync(handlers: OperationHandlers): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleOnline = () => {
    console.log('Back online, processing queued operations...');
    processQueue(handlers).then(result => {
      if (result.processed > 0) {
        console.log(`Processed ${result.processed} queued operations`);
      }
    });
  };

  window.addEventListener('online', handleOnline);

  // Process any pending operations on init
  if (isOnline()) {
    processQueue(handlers);
  }

  return () => {
    window.removeEventListener('online', handleOnline);
  };
}

/**
 * Wrapper to queue operation if offline
 */
export async function executeOrQueue<T>(
  type: QueuedOperation['type'],
  executor: () => Promise<T>,
  payload: unknown
): Promise<{ executed: boolean; result?: T; queued?: boolean }> {
  if (isOnline()) {
    try {
      const result = await executor();
      return { executed: true, result };
    } catch (error) {
      // Network error, queue it
      if (error instanceof TypeError && error.message.includes('fetch')) {
        queueOperation(type, payload);
        return { executed: false, queued: true };
      }
      throw error;
    }
  } else {
    queueOperation(type, payload);
    return { executed: false, queued: true };
  }
}

/**
 * Get queue statistics
 */
export function getQueueStats(): {
  total: number;
  byType: Record<string, number>;
  oldestTimestamp: number | null;
  totalRetries: number;
} {
  const queue = getQueue();

  const byType: Record<string, number> = {};
  let totalRetries = 0;

  queue.forEach(op => {
    byType[op.type] = (byType[op.type] || 0) + 1;
    totalRetries += op.retries;
  });

  return {
    total: queue.length,
    byType,
    oldestTimestamp: queue.length > 0 ? Math.min(...queue.map(op => op.timestamp)) : null,
    totalRetries,
  };
}

/**
 * Clear all queued operations
 */
export function clearQueue(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(QUEUE_STORAGE_KEY);
}

// Note: useOnlineStatus hook moved to hooks/use-online-status.ts to avoid hook rules violation
