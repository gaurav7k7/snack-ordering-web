import { ImagePlus, Loader2, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'react-hot-toast';

import { uploadImageToCloudinary } from '@/services/cloudinaryUpload';
import type { ReviewImage } from '@/types/review';

const MAX_IMAGES = 4;

export function ReviewImageUploader({
  images,
  onChange,
}: {
  images: ReviewImage[];
  onChange: (images: ReviewImage[]) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (images.length >= MAX_IMAGES) {
      toast.error(`You can attach up to ${MAX_IMAGES} images.`);
      return;
    }

    setIsUploading(true);
    try {
      const uploaded = await uploadImageToCloudinary(file);
      onChange([...images, uploaded]);
    } catch (error: any) {
      toast.error(error?.message ?? 'Unable to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {images.map((image, index) => (
          <div key={image.publicId} className="relative h-20 w-20 overflow-hidden rounded-lg border">
            <img src={image.url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, i) => i !== index))}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {images.length < MAX_IMAGES && (
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className="grid h-20 w-20 place-items-center rounded-lg border border-dashed text-muted-foreground transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ImagePlus className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
    </div>
  );
}
