/**
 * Analytics wrapper around PostHog + Sentry error tracking.
 * All calls are no-ops when the relevant env vars are not set (local dev).
 */
import posthog from 'posthog-js';
import * as Sentry from '@sentry/react';

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) ?? 'https://app.posthog.com';

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

let initialised = false;

export function initAnalytics() {
  if (initialised) return;

  // PostHog — product analytics
  if (POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: true,
      autocapture: false,
      persistence: 'localStorage',
      loaded: (ph) => {
        if (import.meta.env.DEV) ph.debug();
      },
    });
  }

  // Sentry — error tracking
  if (SENTRY_DSN) {
    Sentry.init({
      dsn: SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: import.meta.env.PROD ? 0.2 : 1.0,
      replaysOnErrorSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
    });
  }

  initialised = true;
}

export function identifyUser(userId: string, traits?: Record<string, unknown>) {
  if (!initialised) return;
  posthog.identify(userId, traits);
}

export function resetUser() {
  if (!initialised) return;
  posthog.reset();
}

export function track(event: string, properties?: Record<string, unknown>) {
  if (!initialised) return;
  posthog.capture(event, properties);
}
