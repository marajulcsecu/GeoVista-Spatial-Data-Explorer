/**
 * Sanitizes an unknown property value to prevent XSS and formatting anomalies.
 */
export function sanitizePropertyValue(val: unknown): string {
  if (val === null || val === undefined) {
    return '—';
  }
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return '[Complex Object]';
    }
  }
  const str = String(val);
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Strips HTML tags from strings for safe text-only display.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>?/gm, '');
}

/**
 * Formats arbitrary property value for display without stripping legitimate text.
 */
export function formatValueForDisplay(val: unknown): string {
  if (val === null || val === undefined) {
    return '—';
  }
  if (typeof val === 'number') {
    return Number.isInteger(val) ? val.toString() : val.toLocaleString(undefined, { maximumFractionDigits: 6 });
  }
  if (typeof val === 'boolean') {
    return val ? 'True' : 'False';
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val);
    } catch {
      return '[Object]';
    }
  }
  return String(val);
}
