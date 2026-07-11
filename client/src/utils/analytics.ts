import { env } from '@/config/env';

type FbqFunction = {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[];
};

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    fbq?: FbqFunction;
    _fbq?: FbqFunction;
  }
}

let initialized = false;

function loadScript(src: string) {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function initGoogleAnalytics(measurementId: string) {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, { send_page_view: false });
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${measurementId}`);
}

function initMetaPixel(pixelId: string) {
  if (window.fbq) return;

  const fbq = function fbqImpl(...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue.push(args);
    }
  } as FbqFunction;
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq = fbq;

  loadScript('https://connect.facebook.net/en_US/fbevents.js');
  window.fbq('init', pixelId);
}

/** No-op if VITE_GA_MEASUREMENT_ID / VITE_META_PIXEL_ID aren't configured. */
export function initAnalytics() {
  if (initialized || !import.meta.env.PROD) return;
  initialized = true;

  if (env.gaMeasurementId) initGoogleAnalytics(env.gaMeasurementId);
  if (env.metaPixelId) initMetaPixel(env.metaPixelId);
}

export function trackPageView(path: string) {
  if (!import.meta.env.PROD) return;

  if (env.gaMeasurementId && window.gtag) {
    window.gtag('event', 'page_view', { page_path: path });
  }
  if (env.metaPixelId && window.fbq) {
    window.fbq('track', 'PageView');
  }
}
