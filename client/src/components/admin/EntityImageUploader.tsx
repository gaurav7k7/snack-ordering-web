import { ImageIcon, Loader2 } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'react-hot-toast';

import { uploadImageToCloudinary } from '@/services/cloudinaryUpload';
import { cldUrl } from '@/utils/cloudinaryImage';
import { getErrorMessage } from '@/utils/getErrorMessage';

type EntityImageUploaderProps = {
  imageUrl?: string;
  label: string;
  onUpload: (image: { url: string; publicId: string }) => Promise<void> | void;
};

export function EntityImageUploader({ imageUrl, label, onUpload }: EntityImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploading(true);
    try {
      const result = await uploadImageToCloudinary(file);
      await onUpload(result);
      toast.success('Image updated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to upload image.'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-border/70 bg-muted">
        {imageUrl ? (
          <img src={cldUrl(imageUrl, 'thumbnail')} alt="" className="h-full w-full object-cover" />
        ) : (
          <ImageIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label={`${imageUrl ? 'Change' : 'Add'} image for ${label}`}
        className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
      >
        {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : imageUrl ? 'Change' : 'Add image'}
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
    </div>
  );
}
