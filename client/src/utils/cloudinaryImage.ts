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
  card: { width: 480, height: 480 },
  gallery: { width: 900, height: 900 },
  hero: { width: 1920, crop: 'scale' },
} satisfies Record<string, TransformOptions>;

export function cldUrl(url: string | undefined | null, preset: keyof typeof IMAGE_PRESETS) {
  return optimizeImageUrl(url, IMAGE_PRESETS[preset]);
}
