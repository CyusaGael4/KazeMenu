import { API_BASE } from '../services/api';

export function getImageUrl(url) {
  if (!url) return '';

  const apiUrl = new URL(API_BASE, window.location.origin);
  const imageUrl = new URL(url, apiUrl);
  if (imageUrl.pathname.startsWith('/uploads/')) {
    return new URL(imageUrl.pathname, apiUrl.origin).href;
  }
  return imageUrl.href;
}
