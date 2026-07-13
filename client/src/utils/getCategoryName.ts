import type { ApiProductCategory } from '@/types/product';

/**
 * Category may arrive as a populated `{ _id, name, slug }` object or, in a
 * few lightweight/legacy responses, a bare id string — never render either
 * form directly, always resolve through this.
 */
export function getCategoryName(category: ApiProductCategory | string | undefined | null): string {
  if (!category) return '';
  return typeof category === 'string' ? category : category.name;
}

export function getCategoryId(category: ApiProductCategory | string | undefined | null): string {
  if (!category) return '';
  return typeof category === 'string' ? category : category._id;
}
