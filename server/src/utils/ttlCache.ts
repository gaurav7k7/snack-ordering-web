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
