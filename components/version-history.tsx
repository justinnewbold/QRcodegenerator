'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  QRVersion,
  QRSnapshot,
  getVersionHistory,
  getVersionTimeline,
  getVersion,
  restoreVersion,
  compareVersions,
  exportVersionHistory,
  getVersioningStats,
  cleanupOldVersions,
} from '@/lib/qr-versioning';
import {
  History,
  X,
  RotateCcw,
  Download,
  Trash2,
  GitBranch,
  GitCommit,
  Eye,
  ArrowRight,
  Check,
  AlertCircle,
  Clock,
  Palette,
  Type,
  Settings,
  Plus,
} from 'lucide-react';

interface VersionHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  qrId: string;
  qrName?: string;
  onRestore?: (snapshot: QRSnapshot) => void;
}

export function VersionHistory({
  isOpen,
  onClose,
  qrId,
  qrName,
  onRestore,
}: VersionHistoryProps) {
  const [timeline, setTimeline] = useState<ReturnType<typeof getVersionTimeline>>([]);
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [compareMode, setCompareMode] = useState(false);
  const [previewVersion, setPreviewVersion] = useState<QRVersion | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  // Load timeline
  useEffect(() => {
    if (isOpen && qrId) {
      setTimeline(getVersionTimeline(qrId));
      setSelectedVersions([]);
      setCompareMode(false);
      setPreviewVersion(null);
    }
  }, [isOpen, qrId]);

  // Handle restore
  const handleRestore = (versionId: string) => {
    const version = getVersion(qrId, versionId);
    if (version && onRestore) {
      restoreVersion(qrId, versionId);
      onRestore(version.snapshot);
      setRestoreSuccess(true);
      setTimeline(getVersionTimeline(qrId));
      setTimeout(() => setRestoreSuccess(false), 2000);
    }
  };

  // Handle preview
  const handlePreview = (versionId: string) => {
    const version = getVersion(qrId, versionId);
    setPreviewVersion(version);
  };

  // Handle export
  const handleExport = () => {
    const json = exportVersionHistory(qrId);
    if (json) {
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-history-${qrId.slice(0, 8)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Toggle version selection for comparison
  const toggleVersionSelection = (versionId: string) => {
    if (selectedVersions.includes(versionId)) {
      setSelectedVersions(prev => prev.filter(v => v !== versionId));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions(prev => [...prev, versionId]);
    }
  };

  // Get comparison data
  const comparison = useMemo(() => {
    if (selectedVersions.length !== 2) return null;
    return compareVersions(qrId, selectedVersions[0], selectedVersions[1]);
  }, [qrId, selectedVersions]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewVersion) {
          setPreviewVersion(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, previewVersion, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Version History</h2>
              <p className="text-sm text-muted-foreground">
                {qrName || 'QR Code'} • {timeline.length} version{timeline.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium ${
                compareMode
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              <GitBranch className="h-4 w-4" />
              Compare
            </button>
            <button
              onClick={handleExport}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              title="Export history"
            >
              <Download className="h-4 w-4" />
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {timeline.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">No version history</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Changes will be tracked automatically
              </p>
            </div>
          ) : compareMode && selectedVersions.length === 2 ? (
            <ComparisonView
              qrId={qrId}
              version1Id={selectedVersions[0]}
              version2Id={selectedVersions[1]}
              comparison={comparison || []}
              onBack={() => setSelectedVersions([])}
            />
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 h-full w-0.5 bg-border" />

              {/* Timeline items */}
              <div className="space-y-4">
                {timeline.map((item, index) => (
                  <TimelineItem
                    key={item.versionId}
                    item={item}
                    isFirst={index === 0}
                    isLast={index === timeline.length - 1}
                    compareMode={compareMode}
                    isSelected={selectedVersions.includes(item.versionId)}
                    onSelect={() => toggleVersionSelection(item.versionId)}
                    onPreview={() => handlePreview(item.versionId)}
                    onRestore={() => handleRestore(item.versionId)}
                    showRestore={!!onRestore && !item.isCurrent}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Compare mode footer */}
        {compareMode && selectedVersions.length < 2 && (
          <div className="border-t border-border p-4 text-center text-sm text-muted-foreground">
            Select {2 - selectedVersions.length} more version{selectedVersions.length === 0 ? 's' : ''} to compare
          </div>
        )}

        {/* Restore success notification */}
        {restoreSuccess && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-medium text-white">
            <Check className="h-4 w-4" />
            Version restored successfully
          </div>
        )}

        {/* Preview modal */}
        {previewVersion && (
          <VersionPreview
            version={previewVersion}
            onClose={() => setPreviewVersion(null)}
            onRestore={onRestore ? () => {
              handleRestore(previewVersion.versionId);
              setPreviewVersion(null);
            } : undefined}
          />
        )}
      </div>
    </div>
  );
}

// Timeline Item
function TimelineItem({
  item,
  isFirst,
  isLast,
  compareMode,
  isSelected,
  onSelect,
  onPreview,
  onRestore,
  showRestore,
}: {
  item: ReturnType<typeof getVersionTimeline>[0];
  isFirst: boolean;
  isLast: boolean;
  compareMode: boolean;
  isSelected: boolean;
  onSelect: () => void;
  onPreview: () => void;
  onRestore: () => void;
  showRestore: boolean;
}) {
  const changeTypeIcons = {
    created: Plus,
    content: Type,
    style: Palette,
    settings: Settings,
    restored: RotateCcw,
  };

  const Icon = changeTypeIcons[item.changeType as keyof typeof changeTypeIcons] || GitCommit;

  return (
    <div className="relative flex gap-4 pl-2">
      {/* Timeline dot */}
      <div
        className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          item.isCurrent
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        }`}
      >
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div
        className={`flex-1 rounded-lg border p-3 ${
          compareMode
            ? isSelected
              ? 'border-primary bg-primary/5'
              : 'cursor-pointer border-border hover:border-primary/50'
            : 'border-border'
        }`}
        onClick={compareMode ? onSelect : undefined}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Version {item.versionNumber}</span>
              {item.isCurrent && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                  Current
                </span>
              )}
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {item.changeDescription}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {formatDate(item.timestamp)}
            </p>
          </div>

          {!compareMode && (
            <div className="flex items-center gap-1">
              <button
                onClick={onPreview}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                title="Preview"
              >
                <Eye className="h-4 w-4" />
              </button>
              {showRestore && (
                <button
                  onClick={onRestore}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                  title="Restore this version"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {compareMode && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={onSelect}
              className="h-4 w-4 rounded border-border"
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Comparison View
function ComparisonView({
  qrId,
  version1Id,
  version2Id,
  comparison,
  onBack,
}: {
  qrId: string;
  version1Id: string;
  version2Id: string;
  comparison: { field: string; oldValue: unknown; newValue: unknown }[];
  onBack: () => void;
}) {
  const v1 = getVersion(qrId, version1Id);
  const v2 = getVersion(qrId, version2Id);

  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-primary hover:underline"
      >
        ← Back to timeline
      </button>

      <div className="flex items-center justify-center gap-4">
        <div className="rounded-lg bg-muted p-3 text-center">
          <p className="text-sm text-muted-foreground">Version {v1?.versionNumber}</p>
          <p className="text-xs text-muted-foreground">{v1 && formatDate(v1.timestamp)}</p>
        </div>
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
        <div className="rounded-lg bg-primary/10 p-3 text-center">
          <p className="text-sm text-primary">Version {v2?.versionNumber}</p>
          <p className="text-xs text-muted-foreground">{v2 && formatDate(v2.timestamp)}</p>
        </div>
      </div>

      {comparison.length === 0 ? (
        <div className="rounded-lg bg-muted/50 p-6 text-center">
          <Check className="mx-auto mb-2 h-8 w-8 text-green-500" />
          <p>No differences found</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium">{comparison.length} change{comparison.length !== 1 ? 's' : ''}</p>
          {comparison.map((change, index) => (
            <div
              key={index}
              className="rounded-lg border border-border p-3"
            >
              <p className="mb-2 font-medium capitalize">
                {change.field.replace(/([A-Z])/g, ' $1')}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded bg-red-500/10 p-2">
                  <p className="mb-1 text-xs text-red-600 dark:text-red-400">Before</p>
                  <p className="truncate text-sm font-mono">
                    {formatValue(change.oldValue)}
                  </p>
                </div>
                <div className="rounded bg-green-500/10 p-2">
                  <p className="mb-1 text-xs text-green-600 dark:text-green-400">After</p>
                  <p className="truncate text-sm font-mono">
                    {formatValue(change.newValue)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Version Preview
function VersionPreview({
  version,
  onClose,
  onRestore,
}: {
  version: QRVersion;
  onClose: () => void;
  onRestore?: () => void;
}) {
  const snapshot = version.snapshot;

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-card p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Version {version.versionNumber}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Preview */}
        <div
          className="mb-4 flex h-32 items-center justify-center rounded-lg"
          style={{ backgroundColor: snapshot.backgroundColor }}
        >
          <div
            className="h-24 w-24 rounded-lg"
            style={{
              backgroundColor: snapshot.foregroundColor,
              borderRadius: snapshot.dotStyle === 'dots' ? '50%' :
                           snapshot.dotStyle === 'rounded' ? '8px' : '4px',
            }}
          />
        </div>

        {/* Details */}
        <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">Type</p>
            <p className="font-medium capitalize">{snapshot.type}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Size</p>
            <p className="font-medium">{snapshot.size}px</p>
          </div>
          <div>
            <p className="text-muted-foreground">Style</p>
            <p className="font-medium capitalize">{snapshot.dotStyle}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Error Correction</p>
            <p className="font-medium">{snapshot.errorCorrection}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground">Content</p>
          <p className="truncate font-mono text-sm">{snapshot.content}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
          >
            Close
          </button>
          {onRestore && (
            <button
              onClick={onRestore}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <RotateCcw className="h-4 w-4" />
              Restore
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper functions
function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;

  return date.toLocaleDateString();
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '(empty)';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

// Version History Button
export function VersionHistoryButton({
  qrId,
  qrName,
  onRestore,
}: {
  qrId: string;
  qrName?: string;
  onRestore?: (snapshot: QRSnapshot) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        title="Version history"
      >
        <History className="h-4 w-4" />
        <span className="hidden sm:inline">History</span>
      </button>
      <VersionHistory
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        qrId={qrId}
        qrName={qrName}
        onRestore={onRestore}
      />
    </>
  );
}
