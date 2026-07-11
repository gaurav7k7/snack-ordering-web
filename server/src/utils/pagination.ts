export type PaginationParams = { page: number; limit: number };
export type PaginationMeta = { page: number; limit: number; total: number; totalPages: number };

type ParsePaginationOptions = { defaultLimit?: number; maxLimit?: number };

export function parsePagination(
  query: Record<string, unknown>,
  { defaultLimit = 20, maxLimit = 100 }: ParsePaginationOptions = {},
): PaginationParams {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || defaultLimit, 1), maxLimit);

  return { page, limit };
}

export function buildPaginationMeta(total: number, { page, limit }: PaginationParams): PaginationMeta {
  return { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) };
}
