type DateStyle = 'short' | 'medium' | 'long' | 'datetime';

/**
 * Formats a date consistently across the app.
 * - short: "10 Jul"
 * - medium (default): locale default date, e.g. "10/7/2026"
 * - long: "10 Jul 2026"
 * - datetime: locale default date + time
 */
export function formatDate(value: string | Date, style: DateStyle = 'medium'): string {
  const date = typeof value === 'string' ? new Date(value) : value;

  switch (style) {
    case 'short':
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    case 'long':
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    case 'datetime':
      return date.toLocaleString('en-IN');
    case 'medium':
    default:
      return date.toLocaleDateString('en-IN');
  }
}
