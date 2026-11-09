export const MAX_IMAGE_UPLOAD_BYTES = 3 * 1024 * 1024;
export const MAX_IMAGE_UPLOAD_LABEL = '3 MB';

export function getImageUploadError(file) {
  if (!file || !file.type.startsWith('image/')) return 'Choose an image file to upload.';
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) return `Images must be ${MAX_IMAGE_UPLOAD_LABEL} or smaller.`;
  return '';
}
