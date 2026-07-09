import { env } from '@/config/env';

type UploadSignature = {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
};

async function getUploadSignature(): Promise<UploadSignature> {
  const response = await fetch(`${env.apiBaseUrl}/uploads/signature`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? 'Image uploads are not available right now.');
  }

  const result = await response.json();
  return result.data as UploadSignature;
}

export async function uploadImageToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  const { signature, timestamp, apiKey, cloudName, folder } = await getUploadSignature();

  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', String(timestamp));
  formData.append('signature', signature);
  formData.append('folder', folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Image upload failed. Please try a different image.');
  }

  const result = await response.json();
  return { url: result.secure_url as string, publicId: result.public_id as string };
}
