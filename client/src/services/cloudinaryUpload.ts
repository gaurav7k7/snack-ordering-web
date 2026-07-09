import { env } from '@/config/env';

export class CloudinaryNotConfiguredError extends Error {
  constructor() {
    super('Image uploads are not configured yet. Add your Cloudinary cloud name and upload preset.');
    this.name = 'CloudinaryNotConfiguredError';
  }
}

export function isCloudinaryConfigured() {
  return Boolean(env.cloudinaryCloudName && env.cloudinaryUploadPreset);
}

export async function uploadImageToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  if (!isCloudinaryConfigured()) {
    throw new CloudinaryNotConfiguredError();
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', env.cloudinaryUploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
    { method: 'POST', body: formData },
  );

  if (!response.ok) {
    throw new Error('Image upload failed. Please try a different image.');
  }

  const result = await response.json();
  return { url: result.secure_url as string, publicId: result.public_id as string };
}
