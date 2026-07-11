export function createTtlCache<T>(ttlMs: number) {
  let value: T | undefined;
  let expiresAt = 0;

  return {
    get(): T | undefined {
      if (Date.now() > expiresAt) return undefined;
      return value;
    },
    set(next: T) {
      value = next;
      expiresAt = Date.now() + ttlMs;
    },
    clear() {
      value = undefined;
      expiresAt = 0;
    },
  };
}

// Same idea as createTtlCache, but keyed — for endpoints whose response
// depends on a request parameter (e.g. a date-range selector), so each
// distinct key gets its own independently-expiring cache entry.
export function createKeyedTtlCache<T>(ttlMs: number) {
  const entries = new Map<string, { value: T; expiresAt: number }>();

  return {
    get(key: string): T | undefined {
      const entry = entries.get(key);
      if (!entry || Date.now() > entry.expiresAt) return undefined;
      return entry.value;
    },
    set(key: string, next: T) {
      entries.set(key, { value: next, expiresAt: Date.now() + ttlMs });
    },
    clear() {
      entries.clear();
    },
  };
}
