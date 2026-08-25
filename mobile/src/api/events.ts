import { CanonicalEvent, OrgEvent } from '@/types/event';
import { canonicalListToOrgEvents } from '@/utils/canonicalToLegacy';
import { apiGet } from './client';
import { ApiError } from './errors';

export type GetOrgDataOptions = {
  city?: string;
  categories?: string[];
  id?: string;
};

export async function getOrgData(
  options: GetOrgDataOptions = {}
): Promise<OrgEvent[]> {
  const params = new URLSearchParams();
  if (options.city) params.set('city', options.city);
  if (options.categories?.length) {
    params.set('categories', options.categories.join(','));
  }
  if (options.id) params.set('id', options.id);

  const query = params.toString();
  const path = query ? `/api/events?${query}` : '/api/events';

  const data = await apiGet<{ events?: CanonicalEvent[] }>(path);
  const events: CanonicalEvent[] = Array.isArray(data.events) ? data.events : [];

  if (!Array.isArray(data.events)) {
    throw new ApiError('Invalid response format', 'EMPTY');
  }

  return canonicalListToOrgEvents(events);
}
