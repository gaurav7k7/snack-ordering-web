type ClientEnv = {
  apiBaseUrl: string;
  siteUrl: string;
  gaMeasurementId: string;
  metaPixelId: string;
};

export const env: ClientEnv = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1',
  siteUrl: (import.meta.env.VITE_SITE_URL ?? 'http://localhost:5173').replace(/\/$/, ''),
  gaMeasurementId: import.meta.env.VITE_GA_MEASUREMENT_ID ?? '',
  metaPixelId: import.meta.env.VITE_META_PIXEL_ID ?? '',
};
