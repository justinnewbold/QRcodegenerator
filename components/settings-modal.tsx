'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  UserPreferences,
  getPreferences,
  savePreferences,
  resetPreferences,
  exportPreferences,
  importPreferences,
  getDefaultPreferences,
} from '@/lib/user-preferences';
import { Settings, X, RotateCcw, Download, Upload, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(getDefaultPreferences());
  const [activeTab, setActiveTab] = useState<'qr' | 'ui' | 'export' | 'accessibility'>('qr');
  const [saved, setSaved] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  // Load preferences on mount
  useEffect(() => {
    setPreferences(getPreferences());
  }, [isOpen]);

  // Update a single preference
  const updatePreference = useCallback(<K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      savePreferences({ [key]: value });
      return updated;
    });

    // Show saved indicator
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }, []);

  // Handle reset
  const handleReset = () => {
    if (confirm('Reset all settings to defaults? This cannot be undone.')) {
      resetPreferences();
      setPreferences(getDefaultPreferences());
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }
  };

  // Handle export
  const handleExport = () => {
    const json = exportPreferences();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'qr-generator-settings.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Handle import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importPreferences(content);
      if (success) {
        setPreferences(getPreferences());
        setImportError(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      } else {
        setImportError('Invalid settings file');
        setTimeout(() => setImportError(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-card shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 id="settings-title" className="text-lg font-semibold">Settings</h2>
              <p className="text-sm text-muted-foreground">Customize your experience</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="flex items-center gap-1 text-sm text-green-500">
                <Check className="h-4 w-4" /> Saved
              </span>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close settings"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {[
            { id: 'qr', label: 'QR Defaults' },
            { id: 'ui', label: 'Interface' },
            { id: 'export', label: 'Export' },
            { id: 'accessibility', label: 'Accessibility' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[50vh] overflow-y-auto p-4">
          {/* QR Defaults Tab */}
          {activeTab === 'qr' && (
            <div className="space-y-6">
              <SettingGroup title="Size & Margin">
                <SettingRow label="Default Size" description="QR code size in pixels">
                  <select
                    value={preferences.defaultSize}
                    onChange={e => updatePreference('defaultSize', Number(e.target.value))}
                    className="rounded-lg border border-border bg-background px-3 py-2"
                  >
                    {[200, 256, 300, 400, 512, 600, 800, 1000].map(size => (
                      <option key={size} value={size}>{size}px</option>
                    ))}
                  </select>
                </SettingRow>
                <SettingRow label="Default Margin" description="Quiet zone around QR code">
                  <select
                    value={preferences.defaultMargin}
                    onChange={e => updatePreference('defaultMargin', Number(e.target.value))}
                    className="rounded-lg border border-border bg-background px-3 py-2"
                  >
                    {[0, 1, 2, 3, 4, 5, 6, 8, 10].map(margin => (
                      <option key={margin} value={margin}>{margin}</option>
                    ))}
                  </select>
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Error Correction">
                <SettingRow label="Level" description="Higher levels allow more damage recovery">
                  <select
                    value={preferences.defaultErrorCorrection}
                    onChange={e => updatePreference('defaultErrorCorrection', e.target.value as UserPreferences['defaultErrorCorrection'])}
                    className="rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <option value="L">Low (7%)</option>
                    <option value="M">Medium (15%)</option>
                    <option value="Q">Quartile (25%)</option>
                    <option value="H">High (30%)</option>
                  </select>
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Default Colors">
                <SettingRow label="Foreground" description="QR code modules color">
                  <input
                    type="color"
                    value={preferences.defaultForegroundColor}
                    onChange={e => updatePreference('defaultForegroundColor', e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded-lg border border-border"
                  />
                </SettingRow>
                <SettingRow label="Background" description="QR code background color">
                  <input
                    type="color"
                    value={preferences.defaultBackgroundColor}
                    onChange={e => updatePreference('defaultBackgroundColor', e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded-lg border border-border"
                  />
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Default Styles">
                <SettingRow label="Dot Style" description="Shape of QR code modules">
                  <select
                    value={preferences.defaultDotStyle}
                    onChange={e => updatePreference('defaultDotStyle', e.target.value as UserPreferences['defaultDotStyle'])}
                    className="rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <option value="squares">Squares</option>
                    <option value="dots">Dots</option>
                    <option value="rounded">Rounded</option>
                    <option value="extra-rounded">Extra Rounded</option>
                    <option value="classy">Classy</option>
                  </select>
                </SettingRow>
                <SettingRow label="Corner Style" description="Finder pattern corners">
                  <select
                    value={preferences.defaultCornerStyle}
                    onChange={e => updatePreference('defaultCornerStyle', e.target.value as UserPreferences['defaultCornerStyle'])}
                    className="rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <option value="square">Square</option>
                    <option value="rounded">Rounded</option>
                    <option value="dots">Dots</option>
                    <option value="extra-rounded">Extra Rounded</option>
                  </select>
                </SettingRow>
              </SettingGroup>
            </div>
          )}

          {/* UI Tab */}
          {activeTab === 'ui' && (
            <div className="space-y-6">
              <SettingGroup title="Display">
                <SettingRow label="Compact Mode" description="Reduce spacing and padding">
                  <Toggle
                    checked={preferences.compactMode}
                    onChange={checked => updatePreference('compactMode', checked)}
                  />
                </SettingRow>
                <SettingRow label="Show Advanced Options" description="Always show advanced settings">
                  <Toggle
                    checked={preferences.showAdvancedOptions}
                    onChange={checked => updatePreference('showAdvancedOptions', checked)}
                  />
                </SettingRow>
                <SettingRow label="Auto Preview" description="Update preview as you type">
                  <Toggle
                    checked={preferences.autoPreview}
                    onChange={checked => updatePreference('autoPreview', checked)}
                  />
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="History">
                <SettingRow label="Auto Save" description="Automatically save generated QR codes">
                  <Toggle
                    checked={preferences.autoSaveToHistory}
                    onChange={checked => updatePreference('autoSaveToHistory', checked)}
                  />
                </SettingRow>
                <SettingRow label="Max History Items" description="Maximum items to keep">
                  <select
                    value={preferences.maxHistoryItems}
                    onChange={e => updatePreference('maxHistoryItems', Number(e.target.value))}
                    className="rounded-lg border border-border bg-background px-3 py-2"
                  >
                    {[25, 50, 100, 200, 500].map(count => (
                      <option key={count} value={count}>{count}</option>
                    ))}
                  </select>
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Prompts">
                <SettingRow label="Install Prompt" description="Show app install suggestion">
                  <Toggle
                    checked={preferences.showInstallPrompt}
                    onChange={checked => updatePreference('showInstallPrompt', checked)}
                  />
                </SettingRow>
                <SettingRow label="Show Tips" description="Display helpful tips and hints">
                  <Toggle
                    checked={preferences.showTips}
                    onChange={checked => updatePreference('showTips', checked)}
                  />
                </SettingRow>
              </SettingGroup>
            </div>
          )}

          {/* Export Tab */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <SettingGroup title="Export Defaults">
                <SettingRow label="Default Format" description="Preferred export format">
                  <select
                    value={preferences.defaultExportFormat}
                    onChange={e => updatePreference('defaultExportFormat', e.target.value as UserPreferences['defaultExportFormat'])}
                    className="rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <option value="png">PNG</option>
                    <option value="svg">SVG</option>
                    <option value="jpeg">JPEG</option>
                    <option value="webp">WebP</option>
                    <option value="pdf">PDF</option>
                  </select>
                </SettingRow>
                <SettingRow label="Image Quality" description="For JPEG/WebP formats (1-100)">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={preferences.defaultExportQuality}
                    onChange={e => updatePreference('defaultExportQuality', Math.min(100, Math.max(1, Number(e.target.value))))}
                    className="w-20 rounded-lg border border-border bg-background px-3 py-2"
                  />
                </SettingRow>
                <SettingRow label="Include Margin" description="Add quiet zone to exports">
                  <Toggle
                    checked={preferences.includeMarginInExport}
                    onChange={checked => updatePreference('includeMarginInExport', checked)}
                  />
                </SettingRow>
              </SettingGroup>
            </div>
          )}

          {/* Accessibility Tab */}
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              <SettingGroup title="Motion & Animation">
                <SettingRow label="Reduced Motion" description="Minimize animations">
                  <Toggle
                    checked={preferences.reducedMotion}
                    onChange={checked => updatePreference('reducedMotion', checked)}
                  />
                </SettingRow>
              </SettingGroup>

              <SettingGroup title="Visual">
                <SettingRow label="High Contrast" description="Increase visual contrast">
                  <Toggle
                    checked={preferences.highContrast}
                    onChange={checked => updatePreference('highContrast', checked)}
                  />
                </SettingRow>
                <SettingRow label="Font Size" description="Interface text size">
                  <select
                    value={preferences.fontSize}
                    onChange={e => updatePreference('fontSize', e.target.value as UserPreferences['fontSize'])}
                    className="rounded-lg border border-border bg-background px-3 py-2"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </SettingRow>
              </SettingGroup>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border p-4">
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <RotateCcw className="h-4 w-4" />
              Reset All
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
              <Upload className="h-4 w-4" />
              Import
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Import Error */}
        {importError && (
          <div className="absolute bottom-20 left-4 right-4 rounded-lg bg-red-500/10 px-4 py-2 text-center text-sm text-red-500">
            {importError}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function SettingGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
      <div>
        <p className="font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-primary' : 'bg-muted'
      }`}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

// Settings Button Component for easy integration
export function SettingsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Open settings"
      >
        <Settings className="h-4 w-4" />
        <span className="hidden sm:inline">Settings</span>
      </button>
      <SettingsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
