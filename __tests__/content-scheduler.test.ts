/**
 * Tests for Content Scheduler
 */

import {
  scheduleChange,
  getQRScheduledChanges,
  getPendingChanges,
  getUpcomingChanges,
  cancelChange,
  updateChange,
  deleteChange,
  getSchedulerStats,
  cleanupOldChanges,
  exportScheduledChanges,
  importScheduledChanges,
} from '../lib/content-scheduler';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'dispatchEvent', { value: jest.fn() });

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

describe('scheduleChange', () => {
  it('should create a scheduled change', () => {
    const change = scheduleChange('qr-1', new Date('2025-06-01'), 'new content');

    expect(change.qrId).toBe('qr-1');
    expect(change.newContent).toBe('new content');
    expect(change.status).toBe('pending');
    expect(change.id).toMatch(/^sched-/);
  });

  it('should accept string date', () => {
    const change = scheduleChange('qr-1', '2025-06-01T00:00:00.000Z', 'content');
    expect(change.scheduledFor).toBe('2025-06-01T00:00:00.000Z');
  });

  it('should store metadata options', () => {
    const change = scheduleChange('qr-1', new Date(), 'content', {
      name: 'Campaign',
      repeatType: 'weekly',
      repeatUntil: '2025-12-31T00:00:00.000Z',
    });

    expect(change.metadata?.name).toBe('Campaign');
    expect(change.metadata?.repeatType).toBe('weekly');
    expect(change.metadata?.repeatUntil).toBe('2025-12-31T00:00:00.000Z');
  });

  it('should persist to localStorage', () => {
    scheduleChange('qr-1', new Date(), 'content');
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'qr-scheduled-changes',
      expect.any(String)
    );
  });
});

describe('getQRScheduledChanges', () => {
  it('should return changes for a specific QR code', () => {
    scheduleChange('qr-1', new Date('2025-06-01'), 'content 1');
    scheduleChange('qr-2', new Date('2025-06-02'), 'content 2');
    scheduleChange('qr-1', new Date('2025-06-03'), 'content 3');

    const changes = getQRScheduledChanges('qr-1');
    expect(changes).toHaveLength(2);
    expect(changes.every(c => c.qrId === 'qr-1')).toBe(true);
  });

  it('should return empty array for unknown QR code', () => {
    const changes = getQRScheduledChanges('nonexistent');
    expect(changes).toHaveLength(0);
  });

  it('should sort by scheduled date ascending', () => {
    scheduleChange('qr-1', new Date('2025-06-03'), 'later');
    scheduleChange('qr-1', new Date('2025-06-01'), 'earlier');

    const changes = getQRScheduledChanges('qr-1');
    expect(new Date(changes[0].scheduledFor).getTime())
      .toBeLessThan(new Date(changes[1].scheduledFor).getTime());
  });
});

describe('getPendingChanges', () => {
  it('should only return pending changes', () => {
    const change = scheduleChange('qr-1', new Date(), 'content');
    cancelChange(change.id);
    scheduleChange('qr-2', new Date(), 'content 2');

    const pending = getPendingChanges();
    expect(pending).toHaveLength(1);
    expect(pending[0].status).toBe('pending');
  });
});

describe('cancelChange', () => {
  it('should cancel a pending change', () => {
    const change = scheduleChange('qr-1', new Date(), 'content');

    const result = cancelChange(change.id);
    expect(result).toBe(true);

    const pending = getPendingChanges();
    expect(pending).toHaveLength(0);
  });

  it('should return false for nonexistent change', () => {
    const result = cancelChange('nonexistent');
    expect(result).toBe(false);
  });

  it('should not cancel already cancelled change', () => {
    const change = scheduleChange('qr-1', new Date(), 'content');
    cancelChange(change.id);

    const result = cancelChange(change.id);
    expect(result).toBe(false);
  });
});

describe('updateChange', () => {
  it('should update content of a pending change', () => {
    const change = scheduleChange('qr-1', new Date(), 'old content');

    const updated = updateChange(change.id, { newContent: 'new content' });
    expect(updated?.newContent).toBe('new content');
  });

  it('should update scheduled time', () => {
    const change = scheduleChange('qr-1', new Date(), 'content');
    const newDate = '2025-12-25T00:00:00.000Z';

    const updated = updateChange(change.id, { scheduledFor: newDate });
    expect(updated?.scheduledFor).toBe(newDate);
  });

  it('should return null for nonexistent change', () => {
    const result = updateChange('nonexistent', { newContent: 'test' });
    expect(result).toBeNull();
  });

  it('should not update cancelled change', () => {
    const change = scheduleChange('qr-1', new Date(), 'content');
    cancelChange(change.id);

    const result = updateChange(change.id, { newContent: 'test' });
    expect(result).toBeNull();
  });

  it('should merge metadata updates', () => {
    const change = scheduleChange('qr-1', new Date(), 'content', {
      name: 'Original',
      repeatType: 'none',
    });

    const updated = updateChange(change.id, {
      metadata: { name: 'Updated' },
    });
    expect(updated?.metadata?.name).toBe('Updated');
    expect(updated?.metadata?.repeatType).toBe('none');
  });
});

describe('deleteChange', () => {
  it('should delete a change', () => {
    const change = scheduleChange('qr-1', new Date(), 'content');

    const result = deleteChange(change.id);
    expect(result).toBe(true);
    expect(getQRScheduledChanges('qr-1')).toHaveLength(0);
  });

  it('should return false for nonexistent change', () => {
    const result = deleteChange('nonexistent');
    expect(result).toBe(false);
  });
});

describe('getSchedulerStats', () => {
  it('should return correct stats', () => {
    scheduleChange('qr-1', new Date('2099-01-01'), 'future');
    const toCancel = scheduleChange('qr-2', new Date('2099-02-01'), 'to cancel');
    cancelChange(toCancel.id);

    const stats = getSchedulerStats();
    expect(stats.totalScheduled).toBe(2);
    expect(stats.pending).toBe(1);
    expect(stats.cancelled).toBe(1);
  });

  it('should return empty stats when no changes', () => {
    const stats = getSchedulerStats();
    expect(stats.totalScheduled).toBe(0);
    expect(stats.pending).toBe(0);
    expect(stats.applied).toBe(0);
  });
});

describe('cleanupOldChanges', () => {
  it('should keep pending changes regardless of age', () => {
    // Create a change with an old created date by manually setting localStorage
    const oldChange = {
      id: 'old-1',
      qrId: 'qr-1',
      scheduledFor: '2020-01-01T00:00:00.000Z',
      newContent: 'old content',
      status: 'pending',
      createdAt: '2020-01-01T00:00:00.000Z',
    };
    localStorageMock.setItem('qr-scheduled-changes', JSON.stringify([oldChange]));

    const removed = cleanupOldChanges(30);
    expect(removed).toBe(0);
  });
});

describe('exportScheduledChanges', () => {
  it('should export all changes as JSON', () => {
    scheduleChange('qr-1', new Date(), 'content');

    const exported = exportScheduledChanges();
    const data = JSON.parse(exported);

    expect(data.exportedAt).toBeDefined();
    expect(data.changes).toHaveLength(1);
    expect(data.changes[0].newContent).toBe('content');
  });

  it('should filter by qrId', () => {
    scheduleChange('qr-1', new Date(), 'content 1');
    scheduleChange('qr-2', new Date(), 'content 2');

    const exported = exportScheduledChanges('qr-1');
    const data = JSON.parse(exported);
    expect(data.changes).toHaveLength(1);
    expect(data.changes[0].qrId).toBe('qr-1');
  });
});

describe('importScheduledChanges', () => {
  it('should import changes from JSON', () => {
    const json = JSON.stringify({
      exportedAt: new Date().toISOString(),
      changes: [{
        id: 'imported-1',
        qrId: 'qr-1',
        scheduledFor: '2025-06-01T00:00:00.000Z',
        newContent: 'imported content',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }],
    });

    const result = importScheduledChanges(json);
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
  });

  it('should skip duplicate IDs', () => {
    const change = scheduleChange('qr-1', new Date(), 'original');

    const json = JSON.stringify({
      changes: [{
        id: change.id,
        qrId: 'qr-1',
        scheduledFor: '2025-06-01T00:00:00.000Z',
        newContent: 'duplicate',
        status: 'pending',
        createdAt: new Date().toISOString(),
      }],
    });

    const result = importScheduledChanges(json);
    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(1);
  });

  it('should handle invalid JSON gracefully', () => {
    const result = importScheduledChanges('not json');
    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(0);
  });

  it('should handle missing changes array', () => {
    const result = importScheduledChanges('{}');
    expect(result.imported).toBe(0);
  });
});
