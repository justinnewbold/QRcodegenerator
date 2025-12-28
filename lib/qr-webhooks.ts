/**
 * QR Code Webhook Integration
 * Trigger actions on QR scan events
 */

export interface WebhookConfig {
  id: string;
  qrId: string;
  name: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT';
  headers?: Record<string, string>;
  payload?: Record<string, unknown>;
  events: WebhookEvent[];
  enabled: boolean;
  secret?: string;
  retryCount: number;
  retryDelay: number; // milliseconds
  lastTriggered?: string;
  lastStatus?: 'success' | 'failed';
  lastError?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

export type WebhookEvent = 'scan' | 'expire' | 'limit_reached' | 'password_attempt' | 'location_check';

export interface WebhookLog {
  id: string;
  webhookId: string;
  qrId: string;
  event: WebhookEvent;
  timestamp: string;
  requestUrl: string;
  requestMethod: string;
  requestPayload?: unknown;
  responseStatus?: number;
  responseBody?: string;
  success: boolean;
  error?: string;
  duration: number; // milliseconds
}

const WEBHOOKS_KEY = 'qr-webhooks';
const WEBHOOK_LOGS_KEY = 'qr-webhook-logs';
const MAX_LOGS = 100;

// ============================================
// Webhook Management
// ============================================

/**
 * Get all webhooks
 */
function getAllWebhooks(): Record<string, WebhookConfig> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(WEBHOOKS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save all webhooks
 */
function saveAllWebhooks(webhooks: Record<string, WebhookConfig>): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(WEBHOOKS_KEY, JSON.stringify(webhooks));
}

/**
 * Create a webhook
 */
export function createWebhook(
  qrId: string,
  config: {
    name: string;
    url: string;
    method?: 'GET' | 'POST' | 'PUT';
    headers?: Record<string, string>;
    payload?: Record<string, unknown>;
    events: WebhookEvent[];
    secret?: string;
    retryCount?: number;
    retryDelay?: number;
  }
): WebhookConfig {
  const webhooks = getAllWebhooks();

  const webhook: WebhookConfig = {
    id: `webhook-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    qrId,
    name: config.name,
    url: config.url,
    method: config.method || 'POST',
    headers: config.headers,
    payload: config.payload,
    events: config.events,
    enabled: true,
    secret: config.secret,
    retryCount: config.retryCount || 3,
    retryDelay: config.retryDelay || 1000,
    triggerCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  webhooks[webhook.id] = webhook;
  saveAllWebhooks(webhooks);

  return webhook;
}

/**
 * Get webhook by ID
 */
export function getWebhook(webhookId: string): WebhookConfig | null {
  const webhooks = getAllWebhooks();
  return webhooks[webhookId] || null;
}

/**
 * Get webhooks for a QR code
 */
export function getQRWebhooks(qrId: string): WebhookConfig[] {
  const webhooks = getAllWebhooks();
  return Object.values(webhooks).filter(w => w.qrId === qrId);
}

/**
 * Update webhook
 */
export function updateWebhook(
  webhookId: string,
  updates: Partial<Omit<WebhookConfig, 'id' | 'qrId' | 'createdAt'>>
): WebhookConfig | null {
  const webhooks = getAllWebhooks();
  if (!webhooks[webhookId]) return null;

  webhooks[webhookId] = {
    ...webhooks[webhookId],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  saveAllWebhooks(webhooks);
  return webhooks[webhookId];
}

/**
 * Delete webhook
 */
export function deleteWebhook(webhookId: string): void {
  const webhooks = getAllWebhooks();
  delete webhooks[webhookId];
  saveAllWebhooks(webhooks);
}

/**
 * Enable/disable webhook
 */
export function toggleWebhook(webhookId: string): boolean {
  const webhooks = getAllWebhooks();
  if (!webhooks[webhookId]) return false;

  webhooks[webhookId].enabled = !webhooks[webhookId].enabled;
  webhooks[webhookId].updatedAt = new Date().toISOString();
  saveAllWebhooks(webhooks);

  return webhooks[webhookId].enabled;
}

// ============================================
// Webhook Triggering
// ============================================

/**
 * Trigger webhooks for an event
 */
export async function triggerWebhooks(
  qrId: string,
  event: WebhookEvent,
  data?: Record<string, unknown>
): Promise<{ triggered: number; succeeded: number; failed: number }> {
  const webhooks = getQRWebhooks(qrId).filter(
    w => w.enabled && w.events.includes(event)
  );

  let succeeded = 0;
  let failed = 0;

  for (const webhook of webhooks) {
    const success = await executeWebhook(webhook, event, data);
    if (success) {
      succeeded++;
    } else {
      failed++;
    }
  }

  return { triggered: webhooks.length, succeeded, failed };
}

/**
 * Execute a single webhook
 */
async function executeWebhook(
  webhook: WebhookConfig,
  event: WebhookEvent,
  data?: Record<string, unknown>
): Promise<boolean> {
  const startTime = Date.now();

  const payload = {
    event,
    qrId: webhook.qrId,
    timestamp: new Date().toISOString(),
    webhookId: webhook.id,
    ...webhook.payload,
    ...data,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...webhook.headers,
  };

  if (webhook.secret) {
    headers['X-Webhook-Secret'] = webhook.secret;
    headers['X-Webhook-Signature'] = generateSignature(JSON.stringify(payload), webhook.secret);
  }

  let lastError: string | undefined;
  let success = false;
  let responseStatus: number | undefined;
  let responseBody: string | undefined;

  for (let attempt = 0; attempt <= webhook.retryCount; attempt++) {
    try {
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers,
        body: webhook.method !== 'GET' ? JSON.stringify(payload) : undefined,
      });

      responseStatus = response.status;
      responseBody = await response.text();

      if (response.ok) {
        success = true;
        break;
      } else {
        lastError = `HTTP ${response.status}: ${responseBody}`;
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error';
    }

    if (attempt < webhook.retryCount) {
      await new Promise(resolve => setTimeout(resolve, webhook.retryDelay * (attempt + 1)));
    }
  }

  const duration = Date.now() - startTime;

  // Log the webhook execution
  logWebhookExecution({
    webhookId: webhook.id,
    qrId: webhook.qrId,
    event,
    requestUrl: webhook.url,
    requestMethod: webhook.method,
    requestPayload: payload,
    responseStatus,
    responseBody,
    success,
    error: lastError,
    duration,
  });

  // Update webhook stats
  const webhooks = getAllWebhooks();
  if (webhooks[webhook.id]) {
    webhooks[webhook.id].lastTriggered = new Date().toISOString();
    webhooks[webhook.id].lastStatus = success ? 'success' : 'failed';
    webhooks[webhook.id].lastError = lastError;
    webhooks[webhook.id].triggerCount++;
    saveAllWebhooks(webhooks);
  }

  return success;
}

/**
 * Generate webhook signature using HMAC-SHA256
 * Falls back to a simpler hash if Web Crypto is unavailable
 */
async function generateSignatureAsync(payload: string, secret: string): Promise<string> {
  // Try to use Web Crypto API for proper HMAC-SHA256
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    try {
      const encoder = new TextEncoder();
      const keyData = encoder.encode(secret);
      const payloadData = encoder.encode(payload);

      const key = await crypto.subtle.importKey(
        'raw',
        keyData,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', key, payloadData);
      const hashArray = Array.from(new Uint8Array(signature));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return `sha256=${hashHex}`;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback: Use a simple hash (clearly labeled as fallback)
  return generateSignatureFallback(payload, secret);
}

/**
 * Synchronous fallback signature (not cryptographically secure)
 */
function generateSignatureFallback(payload: string, secret: string): string {
  let hash = 0;
  const combined = payload + secret;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `simple=${Math.abs(hash).toString(16)}`;
}

/**
 * Generate webhook signature (sync wrapper)
 */
function generateSignature(payload: string, secret: string): string {
  // For sync contexts, use the fallback
  return generateSignatureFallback(payload, secret);
}

// ============================================
// Webhook Logs
// ============================================

/**
 * Get all logs
 */
function getAllLogs(): WebhookLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(WEBHOOK_LOGS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Save all logs
 */
function saveAllLogs(logs: WebhookLog[]): void {
  if (typeof window === 'undefined') return;
  // Keep only the last MAX_LOGS
  const trimmedLogs = logs.slice(-MAX_LOGS);
  localStorage.setItem(WEBHOOK_LOGS_KEY, JSON.stringify(trimmedLogs));
}

/**
 * Log webhook execution
 */
function logWebhookExecution(data: Omit<WebhookLog, 'id' | 'timestamp'>): void {
  const logs = getAllLogs();

  const log: WebhookLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...data,
  };

  logs.push(log);
  saveAllLogs(logs);
}

/**
 * Get logs for a webhook
 */
export function getWebhookLogs(webhookId: string, limit: number = 20): WebhookLog[] {
  return getAllLogs()
    .filter(l => l.webhookId === webhookId)
    .slice(-limit)
    .reverse();
}

/**
 * Get logs for a QR code
 */
export function getQRWebhookLogs(qrId: string, limit: number = 50): WebhookLog[] {
  return getAllLogs()
    .filter(l => l.qrId === qrId)
    .slice(-limit)
    .reverse();
}

/**
 * Clear logs for a webhook
 */
export function clearWebhookLogs(webhookId: string): void {
  const logs = getAllLogs().filter(l => l.webhookId !== webhookId);
  saveAllLogs(logs);
}

/**
 * Clear all logs
 */
export function clearAllLogs(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(WEBHOOK_LOGS_KEY);
}

// ============================================
// Test Webhook
// ============================================

/**
 * Test a webhook configuration
 */
export async function testWebhook(webhook: WebhookConfig): Promise<{
  success: boolean;
  status?: number;
  response?: string;
  error?: string;
  duration: number;
}> {
  const startTime = Date.now();

  const testPayload = {
    event: 'test',
    qrId: webhook.qrId,
    webhookId: webhook.id,
    timestamp: new Date().toISOString(),
    test: true,
    ...webhook.payload,
  };

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...webhook.headers,
  };

  if (webhook.secret) {
    headers['X-Webhook-Secret'] = webhook.secret;
  }

  try {
    const response = await fetch(webhook.url, {
      method: webhook.method,
      headers,
      body: webhook.method !== 'GET' ? JSON.stringify(testPayload) : undefined,
    });

    const responseText = await response.text();

    return {
      success: response.ok,
      status: response.status,
      response: responseText.slice(0, 500),
      duration: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
    };
  }
}

// ============================================
// Webhook Templates
// ============================================

export const WEBHOOK_TEMPLATES = [
  {
    name: 'Slack Notification',
    description: 'Send a message to Slack when QR is scanned',
    method: 'POST' as const,
    headers: { 'Content-Type': 'application/json' },
    payload: {
      text: 'QR Code was scanned!',
      blocks: [
        {
          type: 'section',
          text: { type: 'mrkdwn', text: '*QR Code Scanned* :qr_code:' },
        },
      ],
    },
    events: ['scan'] as WebhookEvent[],
  },
  {
    name: 'Discord Notification',
    description: 'Send a message to Discord when QR is scanned',
    method: 'POST' as const,
    headers: { 'Content-Type': 'application/json' },
    payload: {
      content: 'QR Code was scanned!',
      embeds: [
        {
          title: 'QR Code Scan Event',
          color: 5814783,
        },
      ],
    },
    events: ['scan'] as WebhookEvent[],
  },
  {
    name: 'Google Analytics',
    description: 'Track scans in Google Analytics',
    method: 'POST' as const,
    payload: {
      client_id: '{{client_id}}',
      events: [
        {
          name: 'qr_scan',
          params: { qr_id: '{{qr_id}}' },
        },
      ],
    },
    events: ['scan'] as WebhookEvent[],
  },
  {
    name: 'Zapier Webhook',
    description: 'Trigger a Zapier workflow',
    method: 'POST' as const,
    headers: { 'Content-Type': 'application/json' },
    payload: {},
    events: ['scan', 'expire'] as WebhookEvent[],
  },
  {
    name: 'Custom API',
    description: 'Send data to your own API endpoint',
    method: 'POST' as const,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {{your_api_key}}',
    },
    payload: {},
    events: ['scan', 'expire', 'limit_reached'] as WebhookEvent[],
  },
];
