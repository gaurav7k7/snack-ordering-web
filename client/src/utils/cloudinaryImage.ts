type TransformOptions = {
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'thumb' | 'scale';
};

const UPLOAD_MARKER = '/upload/';

// Cloudinary only resizes/re-encodes images that are asked to via a
// transformation string in the URL path — everything the app stores today
// is the raw, full-resolution upload. This injects `f_auto,q_auto` (best
// format + quality for the requesting browser) plus an optional fixed
// width/height so list/thumbnail contexts never ship a multi-MB original.
// Non-Cloudinary URLs (seeded Unsplash images, external links) pass through
// unchanged since Cloudinary's transformation syntax doesn't apply to them.
export function optimizeImageUrl(url: string | undefined | null, options: TransformOptions = {}): string {
  if (!url) return '';
  if (!url.includes('res.cloudinary.com') || !url.includes(UPLOAD_MARKER)) {
    return url;
  }

  const { width, height, crop = 'fill' } = options;
  const parts = ['f_auto', 'q_auto'];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width || height) parts.push(`c_${crop}`);

  return url.replace(UPLOAD_MARKER, `${UPLOAD_MARKER}${parts.join(',')}/`);
}

export const IMAGE_PRESETS = {
  avatar: { width: 96, height: 96 },
  thumbnail: { width: 120, height: 120 },
  // Tight fill-crop to a clean square — deliberately used only by contexts
  // that want a uniform thumbnail shape (category tiles, compare table,
  // wishlist grid, admin banner list). Product cards use `productCard`
  // below instead, so packaging is never cropped.
  card: { width: 480, height: 480 },
  // Product cards render with `object-contain` so the full pack is always
  // visible, but that only works if the SOURCE image isn't already cropped
  // by Cloudinary first — `fit` (not `card`'s default `fill`) sizes the
  // image down to stay within the box without cropping, matching the 4:3
  // card artwork area so packaging never loses its top/bottom/left/right
  // edges, whatever its native aspect ratio.
  productCard: { width: 480, height: 360, crop: 'fit' },
  // Product detail page only: `fit` (not the default `fill`) scales the
  // image down to stay within the box without cropping, so packaging that
  // isn't perfectly square never loses its top/bottom or left/right edges.
  // Kept separate from `thumbnail` above, which many other tight-crop
  // contexts (cart lines, order history, admin lists) intentionally still
  // fill-crop to a clean square.
  galleryThumbnail: { width: 160, height: 160, crop: 'fit' },
  gallery: { width: 900, height: 900, crop: 'fit' },
  hero: { width: 1920, crop: 'scale' },
  // Partner/media logos are almost never square — `fit` inside a generous
  // box keeps every logo's real aspect ratio (a wide wordmark and a square
  // icon both come back uncropped) while still capping the delivered size.
  logo: { width: 400, height: 200, crop: 'fit' },
} satisfies Record<string, TransformOptions>;

export function cldUrl(url: string | undefined | null, preset: keyof typeof IMAGE_PRESETS) {
  return optimizeImageUrl(url, IMAGE_PRESETS[preset]);
}
