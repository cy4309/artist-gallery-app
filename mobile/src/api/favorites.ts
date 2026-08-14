import { apiGet, apiPost } from './client';

export type FavoriteRecord = {
  userId: string;
  eventId: string;
  eventTitle: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  eventUrl?: string;
  imageUrl?: string;
  createdAt?: string;
};

export type FavoriteExtra = {
  eventTitle?: string;
  eventStartDate?: string;
  eventEndDate?: string;
  eventLocation?: string;
  eventUrl?: string;
  imageUrl?: string;
};

export async function fetchFavoriteList(): Promise<FavoriteRecord[]> {
  const data = await apiGet<{ favorites?: FavoriteRecord[] }>(
    '/api/favorites/list'
  );
  return data.favorites ?? [];
}

export async function ensureFavorite(
  eventId: string,
  extra?: FavoriteExtra
): Promise<void> {
  const data = await apiPost<{ success: boolean }>(
    '/api/favorites/ensure',
    { eventId, ...extra }
  );
  if (!data.success) {
    throw new Error('ensureFavorite failed');
  }
}

export async function toggleFavorite(
  eventId: string,
  extra?: FavoriteExtra
): Promise<boolean> {
  const data = await apiPost<{ success: boolean; isFavorite?: boolean }>(
    '/api/favorites/toggle',
    { eventId, ...extra }
  );
  if (!data.success) {
    throw new Error('toggleFavorite failed');
  }
  return Boolean(data.isFavorite);
}
