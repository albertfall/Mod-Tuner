
import type { UploadedImage } from '../types';

/**
 * Converts a Blob to a base64 string.
 */
const blobToBase64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve((reader.result as string).split(',')[1]);
    reader.onerror = (error) => reject(error);
  });

/**
 * Converts a base64 string to a Blob.
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Converts a base64 string into an UploadedImage object.
 */
export async function base64ToUploadedImage(
  base64String: string,
  fileName: string,
  mimeType: string = 'image/jpeg'
): Promise<UploadedImage> {
  const blob = base64ToBlob(base64String, mimeType);
  const file = new File([blob], fileName, { type: mimeType });
  const url = URL.createObjectURL(file);

  return {
    file,
    url,
    base64: base64String,
    mimeType,
  };
}

/**
 * Fetches an image from a URL and converts it into an UploadedImage object.
 */
export async function urlToUploadedImage(
  url: string,
  fileName: string
): Promise<UploadedImage> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from ${url}: ${response.statusText}`);
  }
  const blob = await response.blob();
  const mimeType = blob.type || 'image/jpeg';
  const file = new File([blob], fileName, { type: mimeType });
  const objectUrl = URL.createObjectURL(file);
  const base64 = await blobToBase64(blob);

  return {
    file,
    url: objectUrl,
    base64,
    mimeType,
  };
}
