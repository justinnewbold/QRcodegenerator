'use client';

import { useState, useEffect } from 'react';
import {
  setExpiration,
  getExpirationConfig,
  checkExpirationStatus,
  removeExpiration,
  disableExpiration,
  enableExpiration,
  resetScanCount,
  extendExpiration,
  increaseScanLimit,
  getAllExpiringQRCodes,
  getSoonToExpire,
  getExpiredQRCodes,
  getTimeRemaining,
  ExpiringQRConfig,
} from '@/lib/qr-expiring';
import {
  Clock,
  X,
  Calendar,
  Hash,
  AlertTriangle,
  Check,
  RefreshCw,
  Plus,
  Minus,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from 'lucide-react';

interface ExpiringQRSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  qrId?: string;
  onSave?: () => void;
}

export function ExpiringQRSettings({
  isOpen,
  onClose,
  qrId,
  onSave,
}: ExpiringQRSettingsProps) {
  const [activeTab, setActiveTab] = useState<'settings' | 'overview'>('settings');
  const [config, setConfig] = useState<ExpiringQRConfig | null>(null);
  const [expireByDate, setExpireByDate] = useState(false);
  const [expireByScans, setExpireByScans] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [expiryTime, setExpiryTime] = useState('23:59');
  const [maxScans, setMaxScans] = useState(100);
  const [redirectUrl, setRedirectUrl] = useState('');
  const [allConfigs, setAllConfigs] = useState<ExpiringQRConfig[]>([]);
  const [soonToExpire, setSoonToExpire] = useState<ExpiringQRConfig[]>([]);
  const [expired, setExpired] = useState<ExpiringQRConfig[]>([]);

  // Load config when qrId changes
  useEffect(() => {
    if (isOpen && qrId) {
      const existingConfig = getExpirationConfig(qrId);
      if (existingConfig) {
        setConfig(existingConfig);
        setExpireByDate(!!existingConfig.expiresAt);
        setExpireByScans(existingConfig.maxScans !== undefined);
        if (existingConfig.expiresAt) {
          const date = new Date(existingConfig.expiresAt);
          setExpiryDate(date.toISOString().split('T')[0]);
          setExpiryTime(date.toISOString().split('T')[1].slice(0, 5));
        }
        if (existingConfig.maxScans !== undefined) {
          setMaxScans(existingConfig.maxScans);
        }
        if (existingConfig.expiredRedirectUrl) {
          setRedirectUrl(existingConfig.expiredRedirectUrl);
        }
      } else {
        resetForm();
      }
    }
    loadOverviewData();
  }, [isOpen, qrId]);

  const loadOverviewData = () => {
    setAllConfigs(getAllExpiringQRCodes());
    setSoonToExpire(getSoonToExpire(7));
    setExpired(getExpiredQRCodes());
  };

  const resetForm = () => {
    setConfig(null);
    setExpireByDate(false);
    setExpireByScans(false);
    setExpiryDate('');
    setExpiryTime('23:59');
    setMaxScans(100);
    setRedirectUrl('');
  };

  // Handle save
  const handleSave = () => {
    if (!qrId) return;

    if (!expireByDate && !expireByScans) {
      // Remove expiration if both are disabled
      removeExpiration(qrId);
      onSave?.();
      onClose();
      return;
    }

    const options: {
      expiresAt?: Date;
      maxScans?: number;
      expiredRedirectUrl?: string;
    } = {};

    if (expireByDate && expiryDate) {
      options.expiresAt = new Date(`${expiryDate}T${expiryTime}`);
    }

    if (expireByScans) {
      options.maxScans = maxScans;
    }

    if (redirectUrl) {
      options.expiredRedirectUrl = redirectUrl;
    }

    setExpiration(qrId, options);
    onSave?.();
    onClose();
  };

  // Quick extend options
  const quickExtendDays = [1, 7, 30, 90];
  const quickExtendScans = [10, 50, 100, 500];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Expiring QR Codes</h2>
              <p className="text-sm text-muted-foreground">
                Set time or scan limits for QR codes
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
            onClick={() => setActiveTab('settings')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'settings'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'overview'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Overview ({allConfigs.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'settings' ? (
            qrId ? (
              <div className="space-y-6">
                {/* Current Status */}
                {config && (
                  <div className="rounded-lg border border-border p-4">
                    <h3 className="mb-3 font-medium">Current Status</h3>
                    <ExpirationStatusDisplay qrId={qrId} config={config} />

                    {/* Quick actions */}
                    <div className="mt-4 flex flex-wrap gap-2">
                      {config.expiresAt && (
                        <>
                          <span className="text-sm text-muted-foreground">Quick extend:</span>
                          {quickExtendDays.map((days) => (
                            <button
                              key={days}
                              onClick={() => {
                                extendExpiration(qrId, days);
                                setConfig(getExpirationConfig(qrId));
                              }}
                              className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                            >
                              +{days}d
                            </button>
                          ))}
                        </>
                      )}
                      {config.maxScans !== undefined && (
                        <>
                          <span className="text-sm text-muted-foreground ml-2">Add scans:</span>
                          {quickExtendScans.map((scans) => (
                            <button
                              key={scans}
                              onClick={() => {
                                increaseScanLimit(qrId, scans);
                                setConfig(getExpirationConfig(qrId));
                              }}
                              className="rounded bg-muted px-2 py-1 text-xs hover:bg-muted/80"
                            >
                              +{scans}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Date Expiration */}
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Expire by Date</h3>
                        <p className="text-sm text-muted-foreground">
                          QR code stops working after a specific date
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpireByDate(!expireByDate)}
                      className="text-primary"
                    >
                      {expireByDate ? (
                        <ToggleRight className="h-8 w-8" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {expireByDate && (
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-muted-foreground">Date</label>
                        <input
                          type="date"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Time</label>
                        <input
                          type="time"
                          value={expiryTime}
                          onChange={(e) => setExpiryTime(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Scan Limit */}
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Hash className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">Expire by Scans</h3>
                        <p className="text-sm text-muted-foreground">
                          QR code stops working after X scans
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setExpireByScans(!expireByScans)}
                      className="text-primary"
                    >
                      {expireByScans ? (
                        <ToggleRight className="h-8 w-8" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-muted-foreground" />
                      )}
                    </button>
                  </div>

                  {expireByScans && (
                    <div className="mt-4">
                      <label className="text-sm text-muted-foreground">Maximum Scans</label>
                      <div className="mt-1 flex items-center gap-2">
                        <button
                          onClick={() => setMaxScans(Math.max(1, maxScans - 10))}
                          className="rounded-lg border border-border p-2 hover:bg-muted"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <input
                          type="number"
                          value={maxScans}
                          onChange={(e) => setMaxScans(Math.max(1, parseInt(e.target.value) || 1))}
                          min="1"
                          className="w-24 rounded-lg border border-input bg-background px-3 py-2 text-center text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <button
                          onClick={() => setMaxScans(maxScans + 10)}
                          className="rounded-lg border border-border p-2 hover:bg-muted"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      {config && config.currentScans > 0 && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            Current: {config.currentScans} scans
                          </span>
                          <button
                            onClick={() => {
                              resetScanCount(qrId);
                              setConfig(getExpirationConfig(qrId));
                            }}
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Reset
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Redirect URL */}
                <div className="rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <h3 className="font-medium">Expired Redirect</h3>
                      <p className="text-sm text-muted-foreground">
                        Where to redirect when expired (optional)
                      </p>
                    </div>
                  </div>
                  <input
                    type="url"
                    value={redirectUrl}
                    onChange={(e) => setRedirectUrl(e.target.value)}
                    placeholder="https://example.com/expired"
                    className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground/50" />
                <p className="mt-4 text-muted-foreground">
                  Select a QR code to configure expiration settings
                </p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {/* Soon to expire */}
              {soonToExpire.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-medium text-yellow-500">
                    <AlertTriangle className="h-4 w-4" />
                    Expiring Soon ({soonToExpire.length})
                  </h3>
                  <div className="space-y-2">
                    {soonToExpire.map((config) => (
                      <ExpirationConfigItem key={config.qrId} config={config} />
                    ))}
                  </div>
                </div>
              )}

              {/* Expired */}
              {expired.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-medium text-red-500">
                    <X className="h-4 w-4" />
                    Expired ({expired.length})
                  </h3>
                  <div className="space-y-2">
                    {expired.map((config) => (
                      <ExpirationConfigItem key={config.qrId} config={config} />
                    ))}
                  </div>
                </div>
              )}

              {/* Active */}
              {allConfigs.filter(c => !checkExpirationStatus(c.qrId).isExpired).length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 font-medium text-green-500">
                    <Check className="h-4 w-4" />
                    Active ({allConfigs.filter(c => !checkExpirationStatus(c.qrId).isExpired).length})
                  </h3>
                  <div className="space-y-2">
                    {allConfigs
                      .filter(c => !checkExpirationStatus(c.qrId).isExpired)
                      .map((config) => (
                        <ExpirationConfigItem key={config.qrId} config={config} />
                      ))}
                  </div>
                </div>
              )}

              {allConfigs.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">
                    No expiring QR codes configured yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {activeTab === 'settings' && qrId && (
          <div className="flex gap-2 border-t border-border p-4">
            {config && (
              <button
                onClick={() => {
                  removeExpiration(qrId);
                  resetForm();
                  onSave?.();
                }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-red-500 hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Status Display Component
function ExpirationStatusDisplay({
  qrId,
  config,
}: {
  qrId: string;
  config: ExpiringQRConfig;
}) {
  const status = checkExpirationStatus(qrId);

  return (
    <div className="space-y-2">
      {status.isExpired ? (
        <div className="flex items-center gap-2 text-red-500">
          <X className="h-5 w-5" />
          <span className="font-medium">Expired</span>
          <span className="text-sm">({status.reason})</span>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-green-500">
          <Check className="h-5 w-5" />
          <span className="font-medium">Active</span>
        </div>
      )}

      {config.expiresAt && (
        <div className="text-sm">
          <span className="text-muted-foreground">Expires: </span>
          <span>{new Date(config.expiresAt).toLocaleString()}</span>
          {!status.isExpired && status.expiresAt && (
            <span className="ml-2 text-orange-500">
              ({getTimeRemaining(status.expiresAt)})
            </span>
          )}
        </div>
      )}

      {config.maxScans !== undefined && (
        <div className="text-sm">
          <span className="text-muted-foreground">Scans: </span>
          <span>{config.currentScans} / {config.maxScans}</span>
          {status.percentUsed !== undefined && (
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full transition-all ${
                  status.percentUsed >= 100
                    ? 'bg-red-500'
                    : status.percentUsed >= 80
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
                }`}
                style={{ width: `${Math.min(100, status.percentUsed)}%` }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Config Item for Overview
function ExpirationConfigItem({ config }: { config: ExpiringQRConfig }) {
  const status = checkExpirationStatus(config.qrId);

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <span className="font-medium truncate">{config.qrId}</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            status.isExpired
              ? 'bg-red-500/10 text-red-500'
              : 'bg-green-500/10 text-green-500'
          }`}
        >
          {status.isExpired ? 'Expired' : 'Active'}
        </span>
      </div>
      <div className="mt-1 text-sm text-muted-foreground">
        {config.expiresAt && (
          <span>
            {status.isExpired
              ? `Expired: ${new Date(config.expiresAt).toLocaleDateString()}`
              : getTimeRemaining(config.expiresAt)}
          </span>
        )}
        {config.maxScans !== undefined && (
          <span className="ml-2">
            {config.currentScans}/{config.maxScans} scans
          </span>
        )}
      </div>
    </div>
  );
}
