/**
 * Production Error Logging Framework
 * Captures and logs errors from real users
 */

interface ErrorLog {
  id: string;
  timestamp: string;
  type: 'client' | 'server' | 'api';
  severity: 'error' | 'warning' | 'info';
  message: string;
  stack?: string;
  url?: string;
  userId?: string;
  userEmail?: string;
  metadata?: Record<string, unknown>;
  userAgent?: string;
  componentStack?: string;
}

// In-memory store for errors (in production, send to external service)
const errorStore: ErrorLog[] = [];
const MAX_STORED_ERRORS = 100;

// Generate unique error ID
function generateErrorId(): string {
  return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Get user info from localStorage/session if available
function getUserInfo(): { userId?: string; userEmail?: string } {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem('sb-zlgxekqrlgblgsquvvek-auth-token');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        userId: parsed?.user?.id,
        userEmail: parsed?.user?.email,
      };
    }
  } catch {
    // Ignore parsing errors
  }
  return {};
}

// Log error to console and store
function storeError(error: ErrorLog): void {
  // Store locally
  errorStore.unshift(error);
  if (errorStore.length > MAX_STORED_ERRORS) {
    errorStore.pop();
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.group(`🔴 [${error.type.toUpperCase()}] ${error.severity}`);
    console.error('Message:', error.message);
    if (error.stack) console.error('Stack:', error.stack);
    if (error.url) console.log('URL:', error.url);
    if (error.metadata) console.log('Metadata:', error.metadata);
    console.groupEnd();
  }

  // Send to server endpoint
  sendToServer(error);
}

// Send error to logging endpoint
async function sendToServer(error: ErrorLog): Promise<void> {
  try {
    await fetch('/api/errors/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error),
    });
  } catch {
    // Silently fail - don't cause more errors trying to log errors
    console.warn('Failed to send error to server');
  }
}

/**
 * Log a client-side error (React components, user interactions)
 */
export function logClientError(
  error: Error,
  metadata?: Record<string, unknown>,
  componentStack?: string
): string {
  const errorLog: ErrorLog = {
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    type: 'client',
    severity: 'error',
    message: error.message,
    stack: error.stack,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    componentStack,
    metadata,
    ...getUserInfo(),
  };

  storeError(errorLog);
  return errorLog.id;
}

/**
 * Log an API/fetch error
 */
export function logApiError(
  endpoint: string,
  status: number,
  message: string,
  metadata?: Record<string, unknown>
): string {
  const errorLog: ErrorLog = {
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    type: 'api',
    severity: status >= 500 ? 'error' : 'warning',
    message: `API Error: ${endpoint} returned ${status} - ${message}`,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    metadata: { endpoint, status, ...metadata },
    ...getUserInfo(),
  };

  storeError(errorLog);
  return errorLog.id;
}

/**
 * Log a server-side error (API routes, server components)
 */
export function logServerError(
  error: Error,
  request?: { url?: string; method?: string; headers?: Record<string, string> },
  metadata?: Record<string, unknown>
): string {
  const errorLog: ErrorLog = {
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    type: 'server',
    severity: 'error',
    message: error.message,
    stack: error.stack,
    url: request?.url,
    metadata: {
      method: request?.method,
      ...metadata,
    },
  };

  // Log to console on server
  console.error(`[SERVER ERROR] ${errorLog.id}:`, error.message);
  if (error.stack) console.error(error.stack);

  // In production, you would send this to an external service
  // For now, we store it in memory (will be lost on restart)
  errorStore.unshift(errorLog);
  if (errorStore.length > MAX_STORED_ERRORS) {
    errorStore.pop();
  }

  return errorLog.id;
}

/**
 * Log a warning (non-critical issues)
 */
export function logWarning(
  message: string,
  metadata?: Record<string, unknown>
): string {
  const errorLog: ErrorLog = {
    id: generateErrorId(),
    timestamp: new Date().toISOString(),
    type: 'client',
    severity: 'warning',
    message,
    url: typeof window !== 'undefined' ? window.location.href : undefined,
    metadata,
    ...getUserInfo(),
  };

  storeError(errorLog);
  return errorLog.id;
}

/**
 * Get all stored errors (for admin dashboard)
 */
export function getStoredErrors(): ErrorLog[] {
  return [...errorStore];
}

/**
 * Clear stored errors
 */
export function clearStoredErrors(): void {
  errorStore.length = 0;
}

/**
 * Setup global error handlers (call once on app init)
 */
export function setupGlobalErrorHandlers(): void {
  if (typeof window === 'undefined') return;

  // Catch unhandled errors
  window.onerror = (message, source, lineno, colno, error) => {
    logClientError(
      error || new Error(String(message)),
      { source, lineno, colno }
    );
  };

  // Catch unhandled promise rejections
  window.onunhandledrejection = (event) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));
    logClientError(error, { type: 'unhandledRejection' });
  };

  console.log('🛡️ Global error handlers initialized');
}
