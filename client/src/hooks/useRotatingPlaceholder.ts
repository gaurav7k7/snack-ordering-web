import { useEffect, useState } from 'react';

/**
 * Cycles through a list of placeholder strings on an interval so a search
 * input can hint at several example queries over time instead of just one
 * static string. Purely visual — the input's real value/behavior is
 * untouched, and the placeholder only ever shows while the field is empty
 * (standard browser behavior), so this never interferes with what the user
 * has typed.
 */
export function useRotatingPlaceholder(phrases: string[], intervalMs = 2600) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (phrases.length < 2) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % phrases.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [phrases.length, intervalMs]);

  return phrases[index] ?? phrases[0] ?? '';
}
