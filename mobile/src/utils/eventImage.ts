import { env } from '../config/env';

export function getEventImageUrl(imageUrl?: string): string | null {
  if (!imageUrl) return null;

  const rawUrl =
    imageUrl.startsWith('http://') || imageUrl.startsWith('https://')
      ? imageUrl
      : `https://cloud.culture.tw${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;

  return `${env.apiUrl}/api/image-proxy?url=${encodeURIComponent(rawUrl)}`;
}
