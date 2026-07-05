import { Maximize2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import type { ProductImage } from '@/types/home';

type ProductImageGalleryProps = {
  images: ProductImage[];
  productName: string;
};

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeImageId, setActiveImageId] = useState(images[0]?.id);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);

  const activeImage = useMemo(
    () => images.find((image) => image.id === activeImageId) ?? images[0],
    [activeImageId, images],
  );

  if (!activeImage) return null;

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
            <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
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
        <img
          src={activeImage.url}
          alt={activeImage.alt || productName}
          className="aspect-square w-full object-cover"
        />
        <div
          className="pointer-events-none absolute inset-0 hidden bg-no-repeat opacity-0 transition md:block"
          style={{
            backgroundImage: `url(${activeImage.url})`,
            backgroundSize: '190%',
            backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
            opacity: isZooming ? 1 : 0,
          }}
        />
        <div className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground shadow">
          Cloudinary asset: {activeImage.publicId}
        </div>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute bottom-4 right-4 rounded-full"
          aria-label="Image zoom enabled on hover"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>
    </section>
  );
}
