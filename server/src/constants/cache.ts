// Reference data (categories/brands/tags) only changes via admin CRUD — a
// short public cache lets browsers/CDNs skip the round trip for repeat
// visits within the window.
export const PUBLIC_LIST_CACHE_CONTROL = 'public, max-age=60';
