'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  enhancedValidate,
  EnhancedValidationResult,
  ValidationCheck,
  QRCodeConfig,
} from '@/lib/qr-validator';
import {
  Shield,
  X,
  Check,
  AlertTriangle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Printer,
  Ruler,
  Eye,
  Palette,
  Type,
  Settings2,
  Image,
  Zap,
  RefreshCw,
  Info,
} from 'lucide-react';

interface QRValidatorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  config: QRCodeConfig;
  onConfigChange?: (suggestions: Partial<QRCodeConfig>) => void;
}

export function QRValidatorPanel({
  isOpen,
  onClose,
  config,
  onConfigChange,
}: QRValidatorPanelProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['content', 'contrast']));
  const [showPrintInfo, setShowPrintInfo] = useState(false);

  // Run validation
  const result = useMemo(() => {
    return enhancedValidate(config);
  }, [config]);

  // Group checks by category
  const checksByCategory = useMemo(() => {
    const grouped: Record<string, ValidationCheck[]> = {};
    result.checks.forEach(check => {
      if (!grouped[check.category]) {
        grouped[check.category] = [];
      }
      grouped[check.category].push(check);
    });
    return grouped;
  }, [result.checks]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
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

  const categoryIcons: Record<string, typeof Shield> = {
    content: Type,
    contrast: Palette,
    size: Ruler,
    logo: Image,
    accessibility: Eye,
    technical: Settings2,
  };

  const categoryLabels: Record<string, string> = {
    content: 'Content',
    contrast: 'Color Contrast',
    size: 'Size',
    logo: 'Logo',
    accessibility: 'Accessibility',
    technical: 'Technical',
  };

  const scoreColors: Record<string, string> = {
    excellent: 'text-green-500',
    good: 'text-blue-500',
    fair: 'text-yellow-500',
    poor: 'text-red-500',
  };

  const scoreBgColors: Record<string, string> = {
    excellent: 'bg-green-500/10',
    good: 'bg-blue-500/10',
    fair: 'bg-yellow-500/10',
    poor: 'bg-red-500/10',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${scoreBgColors[result.category]}`}>
              <Shield className={`h-5 w-5 ${scoreColors[result.category]}`} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">QR Code Validator</h2>
              <p className="text-sm text-muted-foreground">
                Real-time quality analysis
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

        {/* Score Overview */}
        <div className="border-b border-border p-4">
          <div className="flex items-center gap-6">
            {/* Score circle */}
            <div className={`relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full ${scoreBgColors[result.category]}`}>
              <div className="text-center">
                <span className={`text-3xl font-bold ${scoreColors[result.category]}`}>
                  {result.score}
                </span>
                <span className={`block text-xs ${scoreColors[result.category]}`}>/ 100</span>
              </div>
              {/* Circular progress */}
              <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-muted/20"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeDasharray={`${result.score * 2.83} 283`}
                  strokeLinecap="round"
                  className={scoreColors[result.category]}
                />
              </svg>
            </div>

            {/* Summary */}
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-2">
                <span className={`text-lg font-semibold capitalize ${scoreColors[result.category]}`}>
                  {result.category}
                </span>
                {result.isValid ? (
                  <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-600">
                    <Check className="h-3 w-3" />
                    Scannable
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-2 py-0.5 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" />
                    Issues Found
                  </span>
                )}
              </div>

              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-1.5">
                  <Check className="h-4 w-4 text-green-500" />
                  <span>{result.summary.passed} passed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>{result.summary.warnings} warnings</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span>{result.summary.errors} errors</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checks by Category */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {Object.entries(checksByCategory).map(([category, checks]) => {
              const Icon = categoryIcons[category] || Settings2;
              const hasErrors = checks.some(c => c.status === 'error');
              const hasWarnings = checks.some(c => c.status === 'warning');
              const isExpanded = expandedCategories.has(category);

              return (
                <div key={category} className="rounded-lg border border-border overflow-hidden">
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex w-full items-center justify-between p-3 hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{categoryLabels[category] || category}</span>
                      {hasErrors && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                          {checks.filter(c => c.status === 'error').length}
                        </span>
                      )}
                      {!hasErrors && hasWarnings && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 text-xs text-white">
                          {checks.filter(c => c.status === 'warning').length}
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {/* Checks */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/20 p-2">
                      <div className="space-y-2">
                        {checks.map(check => (
                          <CheckItem key={check.id} check={check} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Print Recommendations */}
          <div className="mt-4 rounded-lg border border-border">
            <button
              onClick={() => setShowPrintInfo(!showPrintInfo)}
              className="flex w-full items-center justify-between p-3 hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <Printer className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Print Recommendations</span>
              </div>
              {showPrintInfo ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {showPrintInfo && (
              <div className="border-t border-border bg-muted/20 p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Minimum Size</p>
                    <p className="font-medium">
                      {result.printRecommendation.minSizeCm} cm ({result.printRecommendation.minSizeInches}&quot;)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Recommended Size</p>
                    <p className="font-medium">
                      {result.printRecommendation.recommendedSizeCm} cm ({result.printRecommendation.recommendedSizeInches}&quot;)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Max Scan Distance</p>
                    <p className="font-medium">
                      ~{result.printRecommendation.scanDistanceM} m ({result.printRecommendation.scanDistanceFt} ft)
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Print Resolution</p>
                    <p className="font-medium">{result.printRecommendation.dpi} DPI</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  For best results, export as SVG or use high-resolution PNG at 300 DPI.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer with quick actions */}
        {result.summary.errors > 0 && onConfigChange && (
          <div className="border-t border-border p-4">
            <button
              onClick={() => {
                // Suggest fixes
                const fixes: Partial<QRCodeConfig> = {};

                // Fix contrast
                if (result.checks.find(c => c.id === 'contrast' && c.status === 'error')) {
                  fixes.foregroundColor = '#000000';
                  fixes.backgroundColor = '#FFFFFF';
                }

                // Fix size
                if (result.checks.find(c => c.id === 'size' && c.status === 'error')) {
                  fixes.size = 300;
                }

                onConfigChange(fixes);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              <Zap className="h-4 w-4" />
              Auto-Fix Issues
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Individual Check Item
function CheckItem({ check }: { check: ValidationCheck }) {
  const [expanded, setExpanded] = useState(false);

  const statusIcons = {
    pass: <Check className="h-4 w-4 text-green-500" />,
    warning: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
    error: <AlertCircle className="h-4 w-4 text-red-500" />,
  };

  const statusBg = {
    pass: 'bg-green-500/5',
    warning: 'bg-yellow-500/5',
    error: 'bg-red-500/5',
  };

  return (
    <div className={`rounded-lg p-2 ${statusBg[check.status]}`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-2 text-left"
      >
        <div className="mt-0.5">{statusIcons[check.status]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{check.name}</span>
            {(check.details || check.suggestion) && (
              <Info className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm text-muted-foreground">{check.message}</p>
        </div>
      </button>

      {expanded && (check.details || check.suggestion) && (
        <div className="mt-2 ml-6 space-y-1 text-sm">
          {check.details && (
            <p className="text-muted-foreground">{check.details}</p>
          )}
          {check.suggestion && (
            <p className="text-primary">
              <span className="font-medium">Suggestion:</span> {check.suggestion}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Compact validator indicator for inline use
export function ValidatorIndicator({
  config,
  onClick,
}: {
  config: QRCodeConfig;
  onClick?: () => void;
}) {
  const result = useMemo(() => enhancedValidate(config), [config]);

  const scoreColors: Record<string, string> = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    fair: 'bg-yellow-500',
    poor: 'bg-red-500',
  };

  const scoreBorderColors: Record<string, string> = {
    excellent: 'border-green-500/30',
    good: 'border-blue-500/30',
    fair: 'border-yellow-500/30',
    poor: 'border-red-500/30',
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${scoreBorderColors[result.category]} bg-card hover:bg-muted`}
      title="Open QR Validator"
    >
      <div className={`h-2 w-2 rounded-full ${scoreColors[result.category]}`} />
      <span className="font-medium">{result.score}</span>
      {!result.isValid && (
        <AlertCircle className="h-3.5 w-3.5 text-red-500" />
      )}
    </button>
  );
}

// Validator Button
export function QRValidatorButton({
  config,
  onConfigChange,
}: {
  config: QRCodeConfig;
  onConfigChange?: (suggestions: Partial<QRCodeConfig>) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <ValidatorIndicator config={config} onClick={() => setIsOpen(true)} />
      <QRValidatorPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        config={config}
        onConfigChange={onConfigChange}
      />
    </>
  );
}
