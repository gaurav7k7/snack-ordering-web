import { Camera, Loader2, UserRound } from 'lucide-react';
import { useRef, useState, type ChangeEvent } from 'react';
import { toast } from 'react-hot-toast';

import { uploadImageToCloudinary } from '@/services/cloudinaryUpload';
import { cldUrl } from '@/utils/cloudinaryImage';
import { getErrorMessage } from '@/utils/getErrorMessage';

type AvatarUploaderProps = {
  avatarUrl?: string;
  name: string;
  onUpload: (url: string) => Promise<void>;
};

export function AvatarUploader({ avatarUrl, name, onUpload }: AvatarUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploading(true);
    try {
      const { url } = await uploadImageToCloudinary(file);
      await onUpload(url);
      toast.success('Avatar updated.');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to upload avatar.'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative shrink-0">
      <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-full bg-primary/10 text-primary">
        {avatarUrl ? (
          <img src={cldUrl(avatarUrl, 'avatar')} alt={name} className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <UserRound className="h-8 w-8" />
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        aria-label="Change avatar"
        className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
      >
        {isUploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
    </div>
  );
}
