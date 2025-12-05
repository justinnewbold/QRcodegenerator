/**
 * Content Scheduler
 * Schedule QR code content changes at specific times
 */

export interface ScheduledChange {
  id: string;
  qrId: string;
  scheduledFor: string; // ISO date string
  newContent: string;
  newType?: string;
  status: 'pending' | 'applied' | 'failed' | 'cancelled';
  createdAt: string;
  appliedAt?: string;
  error?: string;
  metadata?: {
    name?: string;
    description?: string;
    repeatType?: 'none' | 'daily' | 'weekly' | 'monthly';
    repeatUntil?: string;
  };
}

export interface SchedulerStats {
  totalScheduled: number;
  pending: number;
  applied: number;
  failed: number;
  cancelled: number;
  upcoming: ScheduledChange[];
  overdue: ScheduledChange[];
}

const STORAGE_KEY = 'qr-scheduled-changes';
const CHECK_INTERVAL = 60000; // Check every minute

let checkInterval: NodeJS.Timeout | null = null;

/**
 * Get all scheduled changes
 */
function getAllChanges(): ScheduledChange[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save all changes
 */
function saveAllChanges(changes: ScheduledChange[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(changes));
}

/**
 * Schedule a content change
 */
export function scheduleChange(
  qrId: string,
  scheduledFor: Date | string,
  newContent: string,
  options?: {
    newType?: string;
    name?: string;
    description?: string;
    repeatType?: 'none' | 'daily' | 'weekly' | 'monthly';
    repeatUntil?: string;
  }
): ScheduledChange {
  const changes = getAllChanges();

  const scheduledDate = typeof scheduledFor === 'string'
    ? scheduledFor
    : scheduledFor.toISOString();

  const change: ScheduledChange = {
    id: `sched-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    qrId,
    scheduledFor: scheduledDate,
    newContent,
    newType: options?.newType,
    status: 'pending',
    createdAt: new Date().toISOString(),
    metadata: {
      name: options?.name,
      description: options?.description,
      repeatType: options?.repeatType || 'none',
      repeatUntil: options?.repeatUntil,
    },
  };

  changes.push(change);
  saveAllChanges(changes);

  // Ensure checker is running
  startScheduleChecker();

  return change;
}

/**
 * Get scheduled changes for a specific QR code
 */
export function getQRScheduledChanges(qrId: string): ScheduledChange[] {
  return getAllChanges()
    .filter(c => c.qrId === qrId)
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
}

/**
 * Get all pending changes
 */
export function getPendingChanges(): ScheduledChange[] {
  return getAllChanges()
    .filter(c => c.status === 'pending')
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
}

/**
 * Get upcoming changes (pending and in the future)
 */
export function getUpcomingChanges(limit: number = 10): ScheduledChange[] {
  const now = new Date().toISOString();
  return getAllChanges()
    .filter(c => c.status === 'pending' && c.scheduledFor > now)
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
    .slice(0, limit);
}

/**
 * Get overdue changes (pending but past scheduled time)
 */
export function getOverdueChanges(): ScheduledChange[] {
  const now = new Date().toISOString();
  return getAllChanges()
    .filter(c => c.status === 'pending' && c.scheduledFor <= now)
    .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime());
}

/**
 * Cancel a scheduled change
 */
export function cancelChange(changeId: string): boolean {
  const changes = getAllChanges();
  const index = changes.findIndex(c => c.id === changeId);

  if (index === -1 || changes[index].status !== 'pending') {
    return false;
  }

  changes[index].status = 'cancelled';
  saveAllChanges(changes);
  return true;
}

/**
 * Update a scheduled change
 */
export function updateChange(
  changeId: string,
  updates: {
    scheduledFor?: string;
    newContent?: string;
    newType?: string;
    metadata?: Partial<ScheduledChange['metadata']>;
  }
): ScheduledChange | null {
  const changes = getAllChanges();
  const index = changes.findIndex(c => c.id === changeId);

  if (index === -1 || changes[index].status !== 'pending') {
    return null;
  }

  if (updates.scheduledFor) {
    changes[index].scheduledFor = updates.scheduledFor;
  }
  if (updates.newContent) {
    changes[index].newContent = updates.newContent;
  }
  if (updates.newType !== undefined) {
    changes[index].newType = updates.newType;
  }
  if (updates.metadata) {
    changes[index].metadata = {
      ...changes[index].metadata,
      ...updates.metadata,
    };
  }

  saveAllChanges(changes);
  return changes[index];
}

/**
 * Delete a scheduled change
 */
export function deleteChange(changeId: string): boolean {
  const changes = getAllChanges();
  const index = changes.findIndex(c => c.id === changeId);

  if (index === -1) {
    return false;
  }

  changes.splice(index, 1);
  saveAllChanges(changes);
  return true;
}

/**
 * Apply a scheduled change
 */
export function applyChange(changeId: string): boolean {
  if (typeof window === 'undefined') return false;

  const changes = getAllChanges();
  const index = changes.findIndex(c => c.id === changeId);

  if (index === -1 || changes[index].status !== 'pending') {
    return false;
  }

  const change = changes[index];

  try {
    // Get QR history
    const history = JSON.parse(localStorage.getItem('qr-history') || '[]');
    const qrIndex = history.findIndex((qr: { id: string }) => qr.id === change.qrId);

    if (qrIndex === -1) {
      changes[index].status = 'failed';
      changes[index].error = 'QR code not found';
      saveAllChanges(changes);
      return false;
    }

    // Update content
    history[qrIndex].content = change.newContent;
    if (change.newType) {
      history[qrIndex].type = change.newType;
    }
    history[qrIndex].updatedAt = new Date().toISOString();

    // Save QR history
    localStorage.setItem('qr-history', JSON.stringify(history));

    // Update change status
    changes[index].status = 'applied';
    changes[index].appliedAt = new Date().toISOString();

    // Handle repeating changes
    if (change.metadata?.repeatType && change.metadata.repeatType !== 'none') {
      const nextDate = getNextRepeatDate(
        new Date(change.scheduledFor),
        change.metadata.repeatType
      );

      const repeatUntil = change.metadata.repeatUntil
        ? new Date(change.metadata.repeatUntil)
        : null;

      if (!repeatUntil || nextDate <= repeatUntil) {
        // Create next occurrence
        scheduleChange(change.qrId, nextDate, change.newContent, {
          newType: change.newType,
          name: change.metadata.name,
          description: change.metadata.description,
          repeatType: change.metadata.repeatType,
          repeatUntil: change.metadata.repeatUntil,
        });
      }
    }

    saveAllChanges(changes);

    // Dispatch event
    window.dispatchEvent(new CustomEvent('qr-history-updated'));
    window.dispatchEvent(new CustomEvent('scheduled-change-applied', {
      detail: { changeId, qrId: change.qrId }
    }));

    return true;
  } catch (error) {
    changes[index].status = 'failed';
    changes[index].error = error instanceof Error ? error.message : 'Unknown error';
    saveAllChanges(changes);
    return false;
  }
}

/**
 * Calculate next repeat date
 */
function getNextRepeatDate(
  currentDate: Date,
  repeatType: 'daily' | 'weekly' | 'monthly'
): Date {
  const next = new Date(currentDate);

  switch (repeatType) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
  }

  return next;
}

/**
 * Check and apply due changes
 */
export function checkAndApplyDueChanges(): number {
  const overdue = getOverdueChanges();
  let applied = 0;

  overdue.forEach(change => {
    if (applyChange(change.id)) {
      applied++;
    }
  });

  return applied;
}

/**
 * Start the schedule checker
 */
export function startScheduleChecker(): void {
  if (typeof window === 'undefined') return;
  if (checkInterval) return;

  // Check immediately
  checkAndApplyDueChanges();

  // Then check periodically
  checkInterval = setInterval(() => {
    checkAndApplyDueChanges();
  }, CHECK_INTERVAL);
}

/**
 * Stop the schedule checker
 */
export function stopScheduleChecker(): void {
  if (checkInterval) {
    clearInterval(checkInterval);
    checkInterval = null;
  }
}

/**
 * Get scheduler statistics
 */
export function getSchedulerStats(): SchedulerStats {
  const changes = getAllChanges();
  const now = new Date().toISOString();

  return {
    totalScheduled: changes.length,
    pending: changes.filter(c => c.status === 'pending').length,
    applied: changes.filter(c => c.status === 'applied').length,
    failed: changes.filter(c => c.status === 'failed').length,
    cancelled: changes.filter(c => c.status === 'cancelled').length,
    upcoming: changes
      .filter(c => c.status === 'pending' && c.scheduledFor > now)
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
      .slice(0, 5),
    overdue: changes
      .filter(c => c.status === 'pending' && c.scheduledFor <= now)
      .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()),
  };
}

/**
 * Clear old applied/cancelled changes
 */
export function cleanupOldChanges(daysToKeep: number = 30): number {
  const changes = getAllChanges();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysToKeep);

  const filtered = changes.filter(c => {
    if (c.status === 'pending') return true;
    const date = c.appliedAt || c.createdAt;
    return new Date(date) > cutoff;
  });

  const removed = changes.length - filtered.length;
  saveAllChanges(filtered);
  return removed;
}

/**
 * Export scheduled changes
 */
export function exportScheduledChanges(qrId?: string): string {
  let changes = getAllChanges();

  if (qrId) {
    changes = changes.filter(c => c.qrId === qrId);
  }

  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    changes,
  }, null, 2);
}

/**
 * Import scheduled changes
 */
export function importScheduledChanges(json: string): { imported: number; skipped: number } {
  try {
    const data = JSON.parse(json);
    if (!data.changes || !Array.isArray(data.changes)) {
      return { imported: 0, skipped: 0 };
    }

    const existing = getAllChanges();
    const existingIds = new Set(existing.map(c => c.id));
    let imported = 0;
    let skipped = 0;

    data.changes.forEach((change: ScheduledChange) => {
      if (existingIds.has(change.id)) {
        skipped++;
      } else {
        existing.push(change);
        imported++;
      }
    });

    saveAllChanges(existing);
    return { imported, skipped };
  } catch {
    return { imported: 0, skipped: 0 };
  }
}
