import { env } from '@/config/env';

export function getInterviewImageUrl(coverImage?: string): string | null {
  if (!coverImage) return null;
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage;
  }
  const path = coverImage.startsWith('/') ? coverImage : `/${coverImage}`;
  return `${env.apiUrl}${path}`;
}
