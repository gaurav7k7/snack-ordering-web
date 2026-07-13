const DAY_MS = 24 * 60 * 60 * 1000;

export type QuickDateRange = '7d' | '30d' | '6m' | 'all';

/** Builds a Mongo `createdAt` filter fragment for the newsletter admin's quick date filters. */
export function parseDateRangeFilter(range: unknown): Record<string, unknown> {
  if (range === '7d') return { createdAt: { $gte: new Date(Date.now() - 7 * DAY_MS) } };
  if (range === '30d') return { createdAt: { $gte: new Date(Date.now() - 30 * DAY_MS) } };
  if (range === '6m') return { createdAt: { $gte: new Date(Date.now() - 182 * DAY_MS) } };
  return {};
}
