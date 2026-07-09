import { GripVertical, ImagePlus, Loader2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import { isCloudinaryConfigured, uploadImageToCloudinary } from '@/services/cloudinaryUpload';
import type { ApiProductImage } from '@/types/product';

const MAX_IMAGES = 8;

type ProductImageUploaderProps = {
  images: ApiProductImage[];
  onChange: (images: ApiProductImage[]) => void;
};

export function ProductImageUploader({ images, onChange }: ProductImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const configured = isCloudinaryConfigured();

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = '';
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      toast.error(`You can attach up to ${MAX_IMAGES} images.`);
      return;
    }

    const toUpload = files.slice(0, remaining);
    setIsUploading(true);
    try {
      const uploaded = await Promise.all(
        toUpload.map(async (file) => {
          const result = await uploadImageToCloudinary(file);
          return { ...result, alt: file.name.replace(/\.[^/.]+$/, '') };
        }),
      );
      onChange([...images, ...uploaded]);
    } catch (error: any) {
      toast.error(error?.message ?? 'Unable to upload one or more images.');
    } finally {
      setIsUploading(false);
    }
  };

  const updateAlt = (index: number, alt: string) => {
    onChange(images.map((image, i) => (i === index ? { ...image, alt } : image)));
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <div key={`${image.publicId}-${index}`} className="space-y-1.5 rounded-xl border border-border/70 bg-background p-2">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
              {index === 0 && (
                <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
                aria-label="Remove image"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={() => moveImage(index, index === 0 ? 1 : -1)}
                  className="absolute bottom-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white"
                  aria-label="Reorder image"
                  title="Move toward cover"
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <input
              value={image.alt}
              onChange={(event) => updateAlt(index, event.target.value)}
              placeholder="Alt text"
              className="w-full rounded-md border border-input bg-background px-2 py-1 text-xs outline-none focus:border-primary"
            />
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            disabled={!configured || isUploading}
            onClick={() => inputRef.current?.click()}
            className="grid aspect-square place-items-center rounded-xl border border-dashed text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={handleFileChange} />
      {!configured && (
        <p className="mt-2 text-xs text-muted-foreground">
          Image uploads aren't configured for this site yet (missing Cloudinary cloud name / upload preset).
        </p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        The first image is used as the product's cover photo. Up to {MAX_IMAGES} images.
      </p>
    </div>
  );
}
