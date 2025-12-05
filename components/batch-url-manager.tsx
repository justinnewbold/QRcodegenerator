'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  URLMatch,
  URLReplacement,
  findQRsByUrl,
  getAllUrls,
  previewUrlReplacement,
  applyUrlReplacement,
  replaceDomain,
  getUrlStats,
  exportUrlReport,
} from '@/lib/batch-url-manager';
import {
  Link2,
  X,
  Search,
  Replace,
  AlertTriangle,
  Check,
  Download,
  RefreshCw,
  Globe,
  ExternalLink,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface BatchUrlManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BatchUrlManager({ isOpen, onClose }: BatchUrlManagerProps) {
  const [activeTab, setActiveTab] = useState<'find' | 'replace' | 'domains' | 'stats'>('find');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<URLMatch[]>([]);
  const [oldUrl, setOldUrl] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [exactMatch, setExactMatch] = useState(false);
  const [preview, setPreview] = useState<URLReplacement | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isApplying, setIsApplying] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  // Load all URLs on open
  const allUrls = useMemo(() => {
    if (!isOpen) return [];
    return getAllUrls();
  }, [isOpen]);

  // Handle search
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const results = findQRsByUrl(searchQuery, false);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  // Handle preview
  const handlePreview = () => {
    if (oldUrl && newUrl) {
      const p = previewUrlReplacement(oldUrl, newUrl, exactMatch);
      setPreview(p);
      setSelectedIds(new Set(p.matches.map(m => m.qrId)));
    }
  };

  // Handle apply replacement
  const handleApply = async () => {
    if (!preview) return;

    setIsApplying(true);
    try {
      const r = applyUrlReplacement(
        oldUrl,
        newUrl,
        exactMatch,
        Array.from(selectedIds)
      );
      setResult({ success: r.totalUpdated, failed: r.totalFailed });

      // Reset after success
      setTimeout(() => {
        setOldUrl('');
        setNewUrl('');
        setPreview(null);
        setResult(null);
      }, 3000);
    } finally {
      setIsApplying(false);
    }
  };

  // Toggle selection
  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Link2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Batch URL Manager</h2>
              <p className="text-sm text-muted-foreground">
                Find and update URLs across all saved QR codes
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
          {[
            { id: 'find', label: 'Find URLs', icon: Search },
            { id: 'replace', label: 'Find & Replace', icon: Replace },
            { id: 'domains', label: 'Domains', icon: Globe },
            { id: 'stats', label: 'Statistics', icon: ExternalLink },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'find' && (
            <FindTab
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              searchResults={searchResults}
              allUrls={allUrls}
            />
          )}

          {activeTab === 'replace' && (
            <ReplaceTab
              oldUrl={oldUrl}
              setOldUrl={setOldUrl}
              newUrl={newUrl}
              setNewUrl={setNewUrl}
              exactMatch={exactMatch}
              setExactMatch={setExactMatch}
              preview={preview}
              selectedIds={selectedIds}
              toggleSelection={toggleSelection}
              onPreview={handlePreview}
              onApply={handleApply}
              isApplying={isApplying}
              result={result}
            />
          )}

          {activeTab === 'domains' && <DomainsTab />}

          {activeTab === 'stats' && <StatsTab />}
        </div>
      </div>
    </div>
  );
}

// Find Tab
function FindTab({
  searchQuery,
  setSearchQuery,
  searchResults,
  allUrls,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: URLMatch[];
  allUrls: { url: string; count: number; qrIds: string[] }[];
}) {
  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search URLs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4"
          autoFocus
        />
      </div>

      {/* Search results */}
      {searchQuery.length >= 2 ? (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {searchResults.length} matches found
          </p>
          {searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((match, index) => (
                <UrlMatchCard key={`${match.qrId}-${index}`} match={match} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-muted/50 p-8 text-center">
              <Search className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No URLs match your search</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {allUrls.length} unique URLs in {allUrls.reduce((sum, u) => sum + u.count, 0)} QR codes
          </p>
          <div className="space-y-2">
            {allUrls.slice(0, 20).map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-lg border border-border p-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.url}</p>
                  <p className="text-xs text-muted-foreground">
                    Used in {item.count} QR code{item.count > 1 ? 's' : ''}
                  </p>
                </div>
                <button
                  onClick={() => setSearchQuery(item.url)}
                  className="ml-2 shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Replace Tab
function ReplaceTab({
  oldUrl,
  setOldUrl,
  newUrl,
  setNewUrl,
  exactMatch,
  setExactMatch,
  preview,
  selectedIds,
  toggleSelection,
  onPreview,
  onApply,
  isApplying,
  result,
}: {
  oldUrl: string;
  setOldUrl: (u: string) => void;
  newUrl: string;
  setNewUrl: (u: string) => void;
  exactMatch: boolean;
  setExactMatch: (e: boolean) => void;
  preview: URLReplacement | null;
  selectedIds: Set<string>;
  toggleSelection: (id: string) => void;
  onPreview: () => void;
  onApply: () => void;
  isApplying: boolean;
  result: { success: number; failed: number } | null;
}) {
  return (
    <div className="space-y-4">
      {/* Input fields */}
      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium">Find URL</label>
          <input
            type="text"
            placeholder="https://old-domain.com/page"
            value={oldUrl}
            onChange={(e) => setOldUrl(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Replace with</label>
          <input
            type="text"
            placeholder="https://new-domain.com/page"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2"
          />
        </div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={exactMatch}
            onChange={(e) => setExactMatch(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-sm">Exact match only</span>
        </label>
      </div>

      {/* Preview button */}
      <button
        onClick={onPreview}
        disabled={!oldUrl || !newUrl}
        className="w-full rounded-lg bg-muted px-4 py-2 text-sm font-medium hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Preview Changes
      </button>

      {/* Preview results */}
      {preview && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {preview.matchCount} QR code{preview.matchCount !== 1 ? 's' : ''} will be updated
            </p>
            <button
              onClick={() => {
                if (selectedIds.size === preview.matches.length) {
                  preview.matches.forEach(m => toggleSelection(m.qrId));
                } else {
                  preview.matches.forEach(m => {
                    if (!selectedIds.has(m.qrId)) toggleSelection(m.qrId);
                  });
                }
              }}
              className="text-xs text-primary hover:underline"
            >
              {selectedIds.size === preview.matches.length ? 'Deselect all' : 'Select all'}
            </button>
          </div>

          <div className="max-h-48 space-y-2 overflow-y-auto">
            {preview.matches.map((match, index) => (
              <label
                key={`${match.qrId}-${index}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(match.qrId)}
                  onChange={() => toggleSelection(match.qrId)}
                  className="rounded border-border"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{match.qrName}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    {match.originalUrl}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {/* Apply button */}
          <button
            onClick={onApply}
            disabled={isApplying || selectedIds.size === 0}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isApplying ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Applying...
              </>
            ) : (
              <>
                <Replace className="h-4 w-4" />
                Apply to {selectedIds.size} QR code{selectedIds.size !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      )}

      {/* Result notification */}
      {result && (
        <div className={`flex items-center gap-2 rounded-lg p-3 ${
          result.failed > 0 ? 'bg-yellow-500/10 text-yellow-600' : 'bg-green-500/10 text-green-600'
        }`}>
          <Check className="h-4 w-4" />
          <span>
            Updated {result.success} QR code{result.success !== 1 ? 's' : ''}
            {result.failed > 0 && `, ${result.failed} failed`}
          </span>
        </div>
      )}
    </div>
  );
}

// Domains Tab
function DomainsTab() {
  const [oldDomain, setOldDomain] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number } | null>(null);

  const stats = useMemo(() => getUrlStats(), []);

  const handleReplaceDomain = async () => {
    setIsApplying(true);
    try {
      const r = replaceDomain(oldDomain, newDomain);
      setResult({ success: r.totalUpdated, failed: r.totalFailed });
      setTimeout(() => {
        setOldDomain('');
        setNewDomain('');
        setResult(null);
      }, 3000);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Domain replacement */}
      <div className="rounded-lg border border-border p-4">
        <h3 className="mb-3 font-semibold">Replace Domain</h3>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Old Domain</label>
            <input
              type="text"
              placeholder="old-domain.com"
              value={oldDomain}
              onChange={(e) => setOldDomain(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">New Domain</label>
            <input
              type="text"
              placeholder="new-domain.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          </div>
          <button
            onClick={handleReplaceDomain}
            disabled={!oldDomain || !newDomain || isApplying}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isApplying ? 'Replacing...' : 'Replace Domain'}
          </button>
        </div>

        {result && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-green-500/10 p-3 text-green-600">
            <Check className="h-4 w-4" />
            <span>Updated {result.success} QR codes</span>
          </div>
        )}
      </div>

      {/* Top domains */}
      <div>
        <h3 className="mb-3 font-semibold">Top Domains</h3>
        <div className="space-y-2">
          {stats.topDomains.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{item.domain}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {item.count} occurrence{item.count !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Stats Tab
function StatsTab() {
  const stats = useMemo(() => getUrlStats(), []);

  const handleExport = () => {
    const report = exportUrlReport();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `url-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Total URL Occurrences</p>
          <p className="text-3xl font-bold">{stats.totalUrls}</p>
        </div>
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-muted-foreground">Unique URLs</p>
          <p className="text-3xl font-bold">{stats.uniqueUrls}</p>
        </div>
      </div>

      {/* Top domains chart */}
      <div className="rounded-xl border border-border p-4">
        <h3 className="mb-4 font-semibold">Domain Distribution</h3>
        <div className="space-y-3">
          {stats.topDomains.map((item, index) => {
            const percentage = (item.count / stats.totalUrls) * 100;
            return (
              <div key={index}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium">{item.domain}</span>
                  <span className="text-muted-foreground">{percentage.toFixed(1)}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Export button */}
      <button
        onClick={handleExport}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
      >
        <Download className="h-4 w-4" />
        Export URL Report
      </button>
    </div>
  );
}

// URL Match Card
function UrlMatchCard({ match }: { match: URLMatch }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg border border-border">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between p-3 text-left"
      >
        <div className="min-w-0 flex-1">
          <p className="font-medium">{match.qrName}</p>
          <p className="truncate text-sm text-muted-foreground">{match.originalUrl}</p>
        </div>
        {expanded ? (
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-border p-3 text-sm">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Type</p>
              <p className="font-medium capitalize">{match.qrType}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Field</p>
              <p className="font-medium">{match.field}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Created</p>
              <p className="font-medium">
                {new Date(match.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Button to open manager
export function BatchUrlManagerButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Link2 className="h-4 w-4" />
        <span className="hidden sm:inline">URLs</span>
      </button>
      <BatchUrlManager isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
