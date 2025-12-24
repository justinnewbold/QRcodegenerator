/**
 * Webhook Rate Limiter
 * Implements rate limiting with exponential backoff and circuit breaker pattern
 */

interface RateLimitState {
  webhookId: string;
  requests: number[];
  failures: number;
  lastFailure: number;
  circuitOpen: boolean;
  circuitOpenedAt: number;
  backoffMs: number;
}

interface RateLimitConfig {
  maxRequestsPerMinute: number;
  maxFailures: number;
  circuitBreakerTimeoutMs: number;
  initialBackoffMs: number;
  maxBackoffMs: number;
  backoffMultiplier: number;
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxRequestsPerMinute: 60,
  maxFailures: 5,
  circuitBreakerTimeoutMs: 60000, // 1 minute
  initialBackoffMs: 1000,
  maxBackoffMs: 32000,
  backoffMultiplier: 2,
};

const STORAGE_KEY = 'webhook-rate-limit-state';

/**
 * Get all rate limit states
 */
function getAllStates(): Record<string, RateLimitState> {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Save all states
 */
function saveAllStates(states: Record<string, RateLimitState>): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(states));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Get or create state for a webhook
 */
function getState(webhookId: string): RateLimitState {
  const states = getAllStates();
  if (!states[webhookId]) {
    states[webhookId] = {
      webhookId,
      requests: [],
      failures: 0,
      lastFailure: 0,
      circuitOpen: false,
      circuitOpenedAt: 0,
      backoffMs: DEFAULT_CONFIG.initialBackoffMs,
    };
    saveAllStates(states);
  }
  return states[webhookId];
}

/**
 * Update state for a webhook
 */
function updateState(webhookId: string, update: Partial<RateLimitState>): void {
  const states = getAllStates();
  states[webhookId] = { ...getState(webhookId), ...update };
  saveAllStates(states);
}

/**
 * Check if a webhook request is allowed
 */
export function canMakeRequest(
  webhookId: string,
  config: Partial<RateLimitConfig> = {}
): { allowed: boolean; reason?: string; retryAfterMs?: number } {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const state = getState(webhookId);
  const now = Date.now();

  // Check circuit breaker
  if (state.circuitOpen) {
    const timeSinceOpen = now - state.circuitOpenedAt;
    if (timeSinceOpen < cfg.circuitBreakerTimeoutMs) {
      return {
        allowed: false,
        reason: 'Circuit breaker open due to repeated failures',
        retryAfterMs: cfg.circuitBreakerTimeoutMs - timeSinceOpen,
      };
    } else {
      // Circuit breaker timeout expired, allow half-open state
      updateState(webhookId, { circuitOpen: false, failures: 0 });
    }
  }

  // Check rate limit
  const oneMinuteAgo = now - 60000;
  const recentRequests = state.requests.filter(t => t > oneMinuteAgo);

  if (recentRequests.length >= cfg.maxRequestsPerMinute) {
    const oldestRequest = Math.min(...recentRequests);
    const retryAfterMs = oldestRequest + 60000 - now;
    return {
      allowed: false,
      reason: `Rate limit exceeded (${cfg.maxRequestsPerMinute} requests per minute)`,
      retryAfterMs,
    };
  }

  // Check backoff
  if (state.failures > 0) {
    const timeSinceLastFailure = now - state.lastFailure;
    if (timeSinceLastFailure < state.backoffMs) {
      return {
        allowed: false,
        reason: 'Backing off due to previous failures',
        retryAfterMs: state.backoffMs - timeSinceLastFailure,
      };
    }
  }

  return { allowed: true };
}

/**
 * Record a request attempt
 */
export function recordRequest(webhookId: string): void {
  const state = getState(webhookId);
  const now = Date.now();

  // Clean up old requests (keep only last minute)
  const oneMinuteAgo = now - 60000;
  const recentRequests = state.requests.filter(t => t > oneMinuteAgo);
  recentRequests.push(now);

  updateState(webhookId, { requests: recentRequests });
}

/**
 * Record a successful request
 */
export function recordSuccess(webhookId: string): void {
  updateState(webhookId, {
    failures: 0,
    backoffMs: DEFAULT_CONFIG.initialBackoffMs,
    circuitOpen: false,
  });
}

/**
 * Record a failed request
 */
export function recordFailure(
  webhookId: string,
  config: Partial<RateLimitConfig> = {}
): { circuitOpened: boolean; nextBackoffMs: number } {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const state = getState(webhookId);
  const now = Date.now();

  const newFailures = state.failures + 1;
  const newBackoffMs = Math.min(
    state.backoffMs * cfg.backoffMultiplier,
    cfg.maxBackoffMs
  );

  const circuitOpened = newFailures >= cfg.maxFailures;

  updateState(webhookId, {
    failures: newFailures,
    lastFailure: now,
    backoffMs: newBackoffMs,
    circuitOpen: circuitOpened,
    circuitOpenedAt: circuitOpened ? now : state.circuitOpenedAt,
  });

  return { circuitOpened, nextBackoffMs: newBackoffMs };
}

/**
 * Reset rate limit state for a webhook
 */
export function resetRateLimit(webhookId: string): void {
  const states = getAllStates();
  delete states[webhookId];
  saveAllStates(states);
}

/**
 * Get rate limit status for display
 */
export function getRateLimitStatus(webhookId: string): {
  requestsInLastMinute: number;
  failures: number;
  circuitOpen: boolean;
  backoffMs: number;
  healthy: boolean;
} {
  const state = getState(webhookId);
  const now = Date.now();
  const oneMinuteAgo = now - 60000;
  const recentRequests = state.requests.filter(t => t > oneMinuteAgo);

  return {
    requestsInLastMinute: recentRequests.length,
    failures: state.failures,
    circuitOpen: state.circuitOpen,
    backoffMs: state.backoffMs,
    healthy: !state.circuitOpen && state.failures < 3,
  };
}

/**
 * Execute a webhook with rate limiting
 */
export async function executeWithRateLimit<T>(
  webhookId: string,
  executor: () => Promise<T>,
  config: Partial<RateLimitConfig> = {}
): Promise<{ success: boolean; result?: T; error?: string; rateLimited?: boolean }> {
  const check = canMakeRequest(webhookId, config);

  if (!check.allowed) {
    return {
      success: false,
      error: check.reason,
      rateLimited: true,
    };
  }

  recordRequest(webhookId);

  try {
    const result = await executor();
    recordSuccess(webhookId);
    return { success: true, result };
  } catch (error) {
    const { circuitOpened } = recordFailure(webhookId, config);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      rateLimited: circuitOpened,
    };
  }
}

/**
 * Create a rate-limited fetch wrapper
 */
export function createRateLimitedFetch(
  webhookId: string,
  config: Partial<RateLimitConfig> = {}
): (url: string, options?: RequestInit) => Promise<Response> {
  return async (url: string, options?: RequestInit): Promise<Response> => {
    const result = await executeWithRateLimit(
      webhookId,
      () => fetch(url, options),
      config
    );

    if (!result.success) {
      throw new Error(result.error || 'Rate limited');
    }

    return result.result!;
  };
}
