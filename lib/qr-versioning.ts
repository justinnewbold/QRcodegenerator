/**
 * QR Code Versioning System
 * Track changes and maintain version history for QR codes
 */

export interface QRVersion {
  versionId: string;
  versionNumber: number;
  timestamp: string;
  changeType: 'created' | 'content' | 'style' | 'settings' | 'restored';
  changeDescription: string;
  snapshot: QRSnapshot;
  previousVersionId?: string;
}

export interface QRSnapshot {
  content: string;
  type: string;
  size: number;
  errorCorrection: string;
  foregroundColor: string;
  backgroundColor: string;
  dotStyle: string;
  cornerStyle: string;
  margin: number;
  logoUrl?: string;
  frameStyle?: string;
  frameText?: string;
  gradient?: {
    enabled: boolean;
    type: string;
    colors: string[];
    rotation?: number;
  };
  eyeColors?: {
    topLeft?: string;
    topRight?: string;
    bottomLeft?: string;
  };
}

export interface QRVersionHistory {
  qrId: string;
  currentVersionId: string;
  versions: QRVersion[];
  maxVersions: number;
}

const STORAGE_KEY = 'qr-version-history';
const MAX_VERSIONS_PER_QR = 20;

/**
 * Get all version histories
 */
function getAllHistories(): Record<string, QRVersionHistory> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save all histories
 */
function saveAllHistories(histories: Record<string, QRVersionHistory>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(histories));
}

/**
 * Get version history for a specific QR code
 */
export function getVersionHistory(qrId: string): QRVersionHistory | null {
  const histories = getAllHistories();
  return histories[qrId] || null;
}

/**
 * Create a new version for a QR code
 */
export function createVersion(
  qrId: string,
  snapshot: QRSnapshot,
  changeType: QRVersion['changeType'],
  changeDescription: string
): QRVersion {
  const histories = getAllHistories();
  const existingHistory = histories[qrId];

  const versionId = `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const versionNumber = existingHistory
    ? existingHistory.versions.length + 1
    : 1;

  const newVersion: QRVersion = {
    versionId,
    versionNumber,
    timestamp: new Date().toISOString(),
    changeType,
    changeDescription,
    snapshot,
    previousVersionId: existingHistory?.currentVersionId,
  };

  if (existingHistory) {
    // Add new version and trim if necessary
    existingHistory.versions.push(newVersion);
    if (existingHistory.versions.length > existingHistory.maxVersions) {
      existingHistory.versions = existingHistory.versions.slice(-existingHistory.maxVersions);
    }
    existingHistory.currentVersionId = versionId;
  } else {
    // Create new history
    histories[qrId] = {
      qrId,
      currentVersionId: versionId,
      versions: [newVersion],
      maxVersions: MAX_VERSIONS_PER_QR,
    };
  }

  saveAllHistories(histories);
  return newVersion;
}

/**
 * Get a specific version
 */
export function getVersion(qrId: string, versionId: string): QRVersion | null {
  const history = getVersionHistory(qrId);
  if (!history) return null;
  return history.versions.find(v => v.versionId === versionId) || null;
}

/**
 * Get the current version
 */
export function getCurrentVersion(qrId: string): QRVersion | null {
  const history = getVersionHistory(qrId);
  if (!history) return null;
  return history.versions.find(v => v.versionId === history.currentVersionId) || null;
}

/**
 * Restore a previous version
 */
export function restoreVersion(qrId: string, versionId: string): QRVersion | null {
  const history = getVersionHistory(qrId);
  if (!history) return null;

  const targetVersion = history.versions.find(v => v.versionId === versionId);
  if (!targetVersion) return null;

  // Create a new version that restores the old state
  return createVersion(
    qrId,
    targetVersion.snapshot,
    'restored',
    `Restored to version ${targetVersion.versionNumber}`
  );
}

/**
 * Compare two versions
 */
export function compareVersions(
  qrId: string,
  versionId1: string,
  versionId2: string
): {
  field: string;
  oldValue: unknown;
  newValue: unknown;
}[] {
  const v1 = getVersion(qrId, versionId1);
  const v2 = getVersion(qrId, versionId2);

  if (!v1 || !v2) return [];

  const changes: { field: string; oldValue: unknown; newValue: unknown }[] = [];
  const s1 = v1.snapshot;
  const s2 = v2.snapshot;

  const compareField = (field: keyof QRSnapshot) => {
    const val1 = s1[field];
    const val2 = s2[field];
    if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      changes.push({ field, oldValue: val1, newValue: val2 });
    }
  };

  const fields: (keyof QRSnapshot)[] = [
    'content', 'type', 'size', 'errorCorrection',
    'foregroundColor', 'backgroundColor', 'dotStyle', 'cornerStyle',
    'margin', 'logoUrl', 'frameStyle', 'frameText', 'gradient', 'eyeColors',
  ];

  fields.forEach(compareField);

  return changes;
}

/**
 * Get version timeline for display
 */
export function getVersionTimeline(qrId: string): {
  versionId: string;
  versionNumber: number;
  timestamp: string;
  changeType: string;
  changeDescription: string;
  isCurrent: boolean;
}[] {
  const history = getVersionHistory(qrId);
  if (!history) return [];

  return history.versions
    .map(v => ({
      versionId: v.versionId,
      versionNumber: v.versionNumber,
      timestamp: v.timestamp,
      changeType: v.changeType,
      changeDescription: v.changeDescription,
      isCurrent: v.versionId === history.currentVersionId,
    }))
    .reverse(); // Most recent first
}

/**
 * Delete version history for a QR code
 */
export function deleteVersionHistory(qrId: string): boolean {
  const histories = getAllHistories();
  if (!histories[qrId]) return false;

  delete histories[qrId];
  saveAllHistories(histories);
  return true;
}

/**
 * Export version history
 */
export function exportVersionHistory(qrId: string): string | null {
  const history = getVersionHistory(qrId);
  if (!history) return null;

  return JSON.stringify({
    exportedAt: new Date().toISOString(),
    ...history,
  }, null, 2);
}

/**
 * Import version history
 */
export function importVersionHistory(json: string): boolean {
  try {
    const data = JSON.parse(json);
    if (!data.qrId || !data.versions) return false;

    const histories = getAllHistories();
    histories[data.qrId] = {
      qrId: data.qrId,
      currentVersionId: data.currentVersionId,
      versions: data.versions,
      maxVersions: data.maxVersions || MAX_VERSIONS_PER_QR,
    };

    saveAllHistories(histories);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get storage statistics
 */
export function getVersioningStats(): {
  totalQRs: number;
  totalVersions: number;
  oldestVersion: string | null;
  newestVersion: string | null;
  storageSize: number;
} {
  const histories = getAllHistories();
  const allVersions = Object.values(histories).flatMap(h => h.versions);

  const sortedByTime = allVersions.length > 0
    ? [...allVersions].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
    : [];

  const oldestVersion = sortedByTime.length > 0 ? sortedByTime[0].timestamp : null;
  const newestVersion = sortedByTime.length > 0 ? sortedByTime[sortedByTime.length - 1].timestamp : null;

  const storageSize = new Blob([JSON.stringify(histories)]).size;

  return {
    totalQRs: Object.keys(histories).length,
    totalVersions: allVersions.length,
    oldestVersion,
    newestVersion,
    storageSize,
  };
}

/**
 * Cleanup old versions to save storage
 */
export function cleanupOldVersions(maxAge: number = 30 * 24 * 60 * 60 * 1000): number {
  const histories = getAllHistories();
  const cutoff = Date.now() - maxAge;
  let removed = 0;

  Object.keys(histories).forEach(qrId => {
    const history = histories[qrId];
    const originalCount = history.versions.length;

    // Keep at least the latest 3 versions
    history.versions = history.versions.filter((v, index) => {
      const isRecent = new Date(v.timestamp).getTime() > cutoff;
      const isInLatest3 = index >= history.versions.length - 3;
      return isRecent || isInLatest3;
    });

    removed += originalCount - history.versions.length;

    // Update current version ID if needed
    if (!history.versions.find(v => v.versionId === history.currentVersionId)) {
      history.currentVersionId = history.versions[history.versions.length - 1]?.versionId || '';
    }
  });

  saveAllHistories(histories);
  return removed;
}

/**
 * Auto-detect change type based on what changed
 */
export function detectChangeType(
  oldSnapshot: QRSnapshot | null,
  newSnapshot: QRSnapshot
): { type: QRVersion['changeType']; description: string } {
  if (!oldSnapshot) {
    return { type: 'created', description: 'Created QR code' };
  }

  // Check content changes
  if (oldSnapshot.content !== newSnapshot.content || oldSnapshot.type !== newSnapshot.type) {
    return { type: 'content', description: 'Updated content' };
  }

  // Check style changes
  const styleFields: (keyof QRSnapshot)[] = [
    'foregroundColor', 'backgroundColor', 'dotStyle', 'cornerStyle',
    'logoUrl', 'frameStyle', 'frameText', 'gradient', 'eyeColors',
  ];

  for (const field of styleFields) {
    if (JSON.stringify(oldSnapshot[field]) !== JSON.stringify(newSnapshot[field])) {
      return { type: 'style', description: `Changed ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}` };
    }
  }

  // Check settings changes
  const settingsFields: (keyof QRSnapshot)[] = ['size', 'errorCorrection', 'margin'];
  for (const field of settingsFields) {
    if (oldSnapshot[field] !== newSnapshot[field]) {
      return { type: 'settings', description: `Changed ${field}` };
    }
  }

  return { type: 'settings', description: 'Minor update' };
}
