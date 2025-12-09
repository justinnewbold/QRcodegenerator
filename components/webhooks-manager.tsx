'use client';

import { useState, useEffect } from 'react';
import {
  createWebhook,
  getWebhook,
  getQRWebhooks,
  updateWebhook,
  deleteWebhook,
  toggleWebhook,
  testWebhook,
  getWebhookLogs,
  getQRWebhookLogs,
  clearWebhookLogs,
  WEBHOOK_TEMPLATES,
  WebhookConfig,
  WebhookEvent,
  WebhookLog,
} from '@/lib/qr-webhooks';
import {
  Webhook,
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  AlertCircle,
  Play,
  Loader2,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  ToggleLeft,
  ToggleRight,
  Copy,
  Zap,
} from 'lucide-react';

interface WebhooksManagerProps {
  isOpen: boolean;
  onClose: () => void;
  qrId?: string;
}

export function WebhooksManager({
  isOpen,
  onClose,
  qrId,
}: WebhooksManagerProps) {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [view, setView] = useState<'list' | 'edit' | 'logs'>('list');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [formMethod, setFormMethod] = useState<'GET' | 'POST' | 'PUT'>('POST');
  const [formEvents, setFormEvents] = useState<WebhookEvent[]>(['scan']);
  const [formSecret, setFormSecret] = useState('');
  const [formRetryCount, setFormRetryCount] = useState(3);
  const [showTemplates, setShowTemplates] = useState(false);

  // Load webhooks
  useEffect(() => {
    if (isOpen && qrId) {
      loadWebhooks();
    }
  }, [isOpen, qrId]);

  const loadWebhooks = () => {
    if (qrId) {
      setWebhooks(getQRWebhooks(qrId));
    }
  };

  // Load logs for selected webhook
  useEffect(() => {
    if (selectedWebhook && view === 'logs') {
      setLogs(getWebhookLogs(selectedWebhook.id, 50));
    }
  }, [selectedWebhook, view]);

  // Reset form
  const resetForm = () => {
    setFormName('');
    setFormUrl('');
    setFormMethod('POST');
    setFormEvents(['scan']);
    setFormSecret('');
    setFormRetryCount(3);
  };

  // Load webhook for editing
  const loadWebhookForEdit = (webhook: WebhookConfig) => {
    setSelectedWebhook(webhook);
    setFormName(webhook.name);
    setFormUrl(webhook.url);
    setFormMethod(webhook.method);
    setFormEvents(webhook.events);
    setFormSecret(webhook.secret || '');
    setFormRetryCount(webhook.retryCount);
    setView('edit');
  };

  // Save webhook
  const handleSave = () => {
    if (!qrId || !formName || !formUrl) return;

    if (selectedWebhook) {
      // Update existing
      updateWebhook(selectedWebhook.id, {
        name: formName,
        url: formUrl,
        method: formMethod,
        events: formEvents,
        secret: formSecret || undefined,
        retryCount: formRetryCount,
      });
    } else {
      // Create new
      createWebhook(qrId, {
        name: formName,
        url: formUrl,
        method: formMethod,
        events: formEvents,
        secret: formSecret || undefined,
        retryCount: formRetryCount,
      });
    }

    loadWebhooks();
    setView('list');
    resetForm();
    setSelectedWebhook(null);
  };

  // Delete webhook
  const handleDelete = (webhookId: string) => {
    if (confirm('Delete this webhook?')) {
      deleteWebhook(webhookId);
      loadWebhooks();
      if (selectedWebhook?.id === webhookId) {
        setSelectedWebhook(null);
        setView('list');
      }
    }
  };

  // Test webhook
  const handleTest = async () => {
    if (!selectedWebhook) return;

    setTesting(true);
    setTestResult(null);

    try {
      const result = await testWebhook(selectedWebhook);
      setTestResult({
        success: result.success,
        message: result.success
          ? `Success! Status: ${result.status} (${result.duration}ms)`
          : `Failed: ${result.error || `Status ${result.status}`}`,
      });
    } catch {
      setTestResult({
        success: false,
        message: 'Test failed: Network error',
      });
    }

    setTesting(false);
  };

  // Toggle event
  const toggleEvent = (event: WebhookEvent) => {
    setFormEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  // Apply template
  const applyTemplate = (template: (typeof WEBHOOK_TEMPLATES)[0]) => {
    setFormName(template.name);
    setFormMethod(template.method);
    setFormEvents(template.events);
    setShowTemplates(false);
  };

  const availableEvents: WebhookEvent[] = [
    'scan',
    'expire',
    'limit_reached',
    'password_attempt',
    'location_check',
  ];

  const eventLabels: Record<WebhookEvent, string> = {
    scan: 'QR Scanned',
    expire: 'QR Expired',
    limit_reached: 'Scan Limit Reached',
    password_attempt: 'Password Attempt',
    location_check: 'Location Check',
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <Webhook className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Webhook Integration</h2>
              <p className="text-sm text-muted-foreground">
                Trigger actions on QR code events
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

        {/* Navigation */}
        {view !== 'list' && (
          <div className="flex items-center gap-2 border-b border-border px-4 py-2">
            <button
              onClick={() => {
                setView('list');
                setSelectedWebhook(null);
                resetForm();
              }}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Webhooks
            </button>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {view === 'edit'
                ? selectedWebhook
                  ? 'Edit Webhook'
                  : 'New Webhook'
                : 'Logs'}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {!qrId ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Webhook className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                Select a QR code to configure webhooks
              </p>
            </div>
          ) : view === 'list' ? (
            <div className="space-y-4">
              {/* Create button */}
              <button
                onClick={() => {
                  resetForm();
                  setSelectedWebhook(null);
                  setView('edit');
                }}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-4 text-sm text-muted-foreground hover:border-primary hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
                Add Webhook
              </button>

              {/* Webhooks list */}
              {webhooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Zap className="h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No webhooks configured. Add one to get started.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {webhooks.map((webhook) => (
                    <div
                      key={webhook.id}
                      className="group rounded-lg border border-border p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              toggleWebhook(webhook.id);
                              loadWebhooks();
                            }}
                          >
                            {webhook.enabled ? (
                              <ToggleRight className="h-6 w-6 text-primary" />
                            ) : (
                              <ToggleLeft className="h-6 w-6 text-muted-foreground" />
                            )}
                          </button>
                          <div>
                            <h4 className="font-medium">{webhook.name}</h4>
                            <p className="text-sm text-muted-foreground truncate max-w-xs">
                              {webhook.url}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={() => {
                              setSelectedWebhook(webhook);
                              setView('logs');
                            }}
                            className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="View logs"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => loadWebhookForEdit(webhook)}
                            className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(webhook.id)}
                            className="rounded p-2 text-muted-foreground hover:bg-muted hover:text-red-500"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Events and status */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {webhook.events.map((event) => (
                          <span
                            key={event}
                            className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                          >
                            {eventLabels[event]}
                          </span>
                        ))}
                        {webhook.lastStatus && (
                          <span
                            className={`flex items-center gap-1 text-xs ${
                              webhook.lastStatus === 'success'
                                ? 'text-green-500'
                                : 'text-red-500'
                            }`}
                          >
                            {webhook.lastStatus === 'success' ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <AlertCircle className="h-3 w-3" />
                            )}
                            {webhook.lastStatus}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {webhook.triggerCount} triggers
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : view === 'edit' ? (
            <div className="space-y-6">
              {/* Templates */}
              <div>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  <Zap className="h-4 w-4" />
                  Use a template
                  {showTemplates ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
                {showTemplates && (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {WEBHOOK_TEMPLATES.map((template) => (
                      <button
                        key={template.name}
                        onClick={() => applyTemplate(template)}
                        className="rounded-lg border border-border p-3 text-left hover:border-primary"
                      >
                        <h5 className="font-medium">{template.name}</h5>
                        <p className="text-xs text-muted-foreground">
                          {template.description}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="My Webhook"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">URL</label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => setFormUrl(e.target.value)}
                    placeholder="https://example.com/webhook"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Method</label>
                  <div className="mt-1 flex gap-2">
                    {(['POST', 'GET', 'PUT'] as const).map((method) => (
                      <button
                        key={method}
                        onClick={() => setFormMethod(method)}
                        className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                          formMethod === method
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Events</label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {availableEvents.map((event) => (
                      <button
                        key={event}
                        onClick={() => toggleEvent(event)}
                        className={`rounded-lg px-3 py-1.5 text-sm ${
                          formEvents.includes(event)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {eventLabels[event]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Secret (optional)</label>
                  <input
                    type="text"
                    value={formSecret}
                    onChange={(e) => setFormSecret(e.target.value)}
                    placeholder="Webhook secret for verification"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Secret will be sent in X-Webhook-Secret header
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Retry Count</label>
                  <select
                    value={formRetryCount}
                    onChange={(e) => setFormRetryCount(parseInt(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="0">No retries</option>
                    <option value="1">1 retry</option>
                    <option value="3">3 retries</option>
                    <option value="5">5 retries</option>
                  </select>
                </div>
              </div>

              {/* Test result */}
              {testResult && (
                <div
                  className={`rounded-lg p-3 ${
                    testResult.success
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-red-500/10 text-red-600'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    {testResult.message}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Logs view
            <div className="space-y-4">
              {selectedWebhook && (
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{selectedWebhook.name}</h4>
                  <button
                    onClick={() => {
                      clearWebhookLogs(selectedWebhook.id);
                      setLogs([]);
                    }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    Clear logs
                  </button>
                </div>
              )}

              {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="h-10 w-10 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No logs yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className={`rounded-lg border p-3 ${
                        log.success ? 'border-green-500/30' : 'border-red-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {log.success ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="text-sm font-medium">{log.event}</span>
                          <span className="text-xs text-muted-foreground">
                            {log.requestMethod}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {log.responseStatus && `Status: ${log.responseStatus}`}
                        {log.error && (
                          <span className="text-red-500"> - {log.error}</span>
                        )}
                        <span className="ml-2">({log.duration}ms)</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {view === 'edit' && qrId && (
          <div className="flex gap-2 border-t border-border p-4">
            {selectedWebhook && (
              <button
                onClick={handleTest}
                disabled={testing || !formUrl}
                className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted disabled:opacity-50"
              >
                {testing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                Test
              </button>
            )}
            <div className="flex-1" />
            <button
              onClick={() => {
                setView('list');
                setSelectedWebhook(null);
                resetForm();
              }}
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!formName || !formUrl || formEvents.length === 0}
              className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
