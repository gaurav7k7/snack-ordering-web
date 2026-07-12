// A minimal structural type (rather than Mongoose's full generic `Model<T>`)
// so this helper can accept any of the taxonomy models without fighting
// Mongoose's invariant generic constraints on `Model`.
type SlugCheckable = {
  exists(filter: Record<string, unknown>): Promise<unknown>;
};

/**
 * Appends -2, -3, ... to baseSlug until a value is found that no other
 * document of this model already uses (excluding excludeId, so an update
 * can keep its own unchanged slug).
 */
export async function ensureUniqueSlug(
  model: SlugCheckable,
  baseSlug: string,
  excludeId?: string,
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  while (await model.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
}
