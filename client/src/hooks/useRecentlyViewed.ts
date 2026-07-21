import { useEffect, useMemo, useState } from 'react';

const RECENTLY_VIEWED_KEY = 'lotusdelight-recently-viewed';
const MAX_RECENTLY_VIEWED = 5;

function readRecentlyViewed() {
  try {
    return JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) ?? '[]') as string[];
  } catch {
    return [];
  }
}

export function useRecentlyViewed(productId: string) {
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useEffect(() => {
    if (!productId) return;

    const existingIds = readRecentlyViewed();
    const nextIds = [productId, ...existingIds.filter((id) => id !== productId)].slice(
      0,
      MAX_RECENTLY_VIEWED,
    );

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(nextIds));
    setRecentIds(nextIds);
  }, [productId]);

  return useMemo(() => recentIds.filter((id) => id !== productId), [productId, recentIds]);
}
