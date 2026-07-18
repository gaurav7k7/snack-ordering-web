import { ImageOff, Maximize2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { ProductImage } from '@/types/home';
import { cldUrl, optimizeImageUrl } from '@/utils/cloudinaryImage';

type ProductImageGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeImageId, setActiveImageId] = useState(images[0]?.id);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());

  const activeImage = useMemo(
    () => images.find((image) => image.id === activeImageId) ?? images[0],
    [activeImageId, images],
  );

  const markImageFailed = (id: string) => {
    setFailedImageIds((current) => {
      if (current.has(id)) return current;
      const next = new Set(current);
      next.add(id);
      return next;
    });
  };

  if (!activeImage) return null;

  const activeImageFailed = failedImageIds.has(activeImage.id);

  return (
    <section className="grid gap-4 lg:grid-cols-[88px_1fr]">
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-visible">
        {images.map((image) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setActiveImageId(image.id)}
            className="h-20 w-20 shrink-0 overflow-hidden rounded-md border bg-card ring-offset-background transition focus:outline-none focus:ring-2 focus:ring-ring data-[active=true]:border-primary"
            data-active={activeImage.id === image.id}
            aria-label={`View ${image.alt}`}
          >
            {failedImageIds.has(image.id) ? (
              <div className="grid h-full w-full place-items-center bg-muted text-muted-foreground">
                <ImageOff className="h-4 w-4" aria-hidden="true" />
              </div>
            ) : (
              <img
                src={cldUrl(image.url, 'thumbnail')}
                alt={image.alt}
                loading="lazy"
                className="h-full w-full object-cover"
                onError={() => markImageFailed(image.id)}
              />
            )}
          </button>
        ))}
      </div>

      <div
        className="order-1 relative overflow-hidden rounded-lg border bg-card lg:order-2"
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          setZoomPosition({
            x: ((event.clientX - rect.left) / rect.width) * 100,
            y: ((event.clientY - rect.top) / rect.height) * 100,
          });
        }}
        onMouseEnter={() => setIsZooming(true)}
        onMouseLeave={() => setIsZooming(false)}
      >
        {activeImageFailed ? (
          <div className="grid aspect-square w-full place-items-center bg-muted text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <ImageOff className="h-10 w-10" aria-hidden="true" />
              <span className="text-sm font-medium">Image unavailable</span>
            </div>
          </div>
        ) : (
          <img
            src={cldUrl(activeImage.url, 'gallery')}
            alt={activeImage.alt || productName}
            fetchPriority="high"
            className="aspect-square w-full object-cover"
            onError={() => markImageFailed(activeImage.id)}
          />
        )}
        <div
          className="pointer-events-none absolute inset-0 hidden bg-no-repeat opacity-0 transition md:block"
          style={{
            backgroundImage: activeImageFailed
              ? undefined
              : `url(${optimizeImageUrl(activeImage.url, { width: 1400, height: 1400 })})`,
            backgroundSize: '190%',
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            opacity: isZooming && !activeImageFailed ? 1 : 0,
          }}
        />
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute bottom-4 right-4 hidden rounded-full md:inline-flex"
          aria-label="Image zoom enabled on hover"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
