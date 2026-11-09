import { useEffect } from 'react';

const SITE_NAME = 'KazeMenu';
const DEFAULT_TITLE = 'KazeMenu — Digital menus and dine-in ordering for restaurants';
const DEFAULT_DESCRIPTION = 'KazeMenu gives restaurants a digital menu, one QR code per table and a live dine-in order queue. Guests browse and order from their phone while your team manages everything in one place.';
const DEFAULT_IMAGE = '/og-image.png';

function setMeta(attribute, key, content) {
  if (!content) return;
  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function absoluteUrl(value) {
  try {
    return new URL(value || DEFAULT_IMAGE, window.location.origin).toString();
  } catch {
    return value || DEFAULT_IMAGE;
  }
}

export default function usePageMeta({ title, description, image, type = 'website', noIndex = false } = {}) {
  useEffect(() => {
    const pageTitle = title ? `${title} | ${SITE_NAME}` : DEFAULT_TITLE;
    const pageDescription = description || DEFAULT_DESCRIPTION;
    const pageImage = absoluteUrl(image);

    document.title = pageTitle;

    setMeta('name', 'description', pageDescription);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', pageDescription);
    setMeta('name', 'twitter:image', pageImage);

    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', pageDescription);
    setMeta('property', 'og:image', pageImage);
    setMeta('property', 'og:image:alt', `${SITE_NAME} — digital menus and dine-in ordering`);
    setMeta('property', 'og:url', window.location.href);

    setMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');
  }, [title, description, image, type, noIndex]);
}
