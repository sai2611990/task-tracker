'use client';

import { useEffect } from 'react';
import { setupGlobalErrorHandlers, logApiError } from '@/lib/error-logging';

// Wrap fetch to log API errors
const originalFetch = typeof window !== 'undefined' ? window.fetch : null;

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Setup global error handlers
    setupGlobalErrorHandlers();

    // Wrap fetch to capture API errors
    if (originalFetch && typeof window !== 'undefined') {
      window.fetch = async (...args) => {
        const response = await originalFetch(...args);

        // Log 4xx and 5xx errors (except 401 which is normal for auth)
        if (response.status >= 400 && response.status !== 401) {
          const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || 'unknown';
          logApiError(
            url,
            response.status,
            response.statusText,
            { method: args[1]?.method || 'GET' }
          );
        }

        return response;
      };
    }

    // Cleanup
    return () => {
      if (originalFetch && typeof window !== 'undefined') {
        window.fetch = originalFetch;
      }
    };
  }, []);

  return <>{children}</>;
}
