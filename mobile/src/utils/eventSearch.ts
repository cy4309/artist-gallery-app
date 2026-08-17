import { OrgEvent } from '@/types/orgEvent';
import { eventCityName } from './city';

export function filterEventsByKeyword(
  events: OrgEvent[],
  query: string
): OrgEvent[] {
  const q = query.trim().toLowerCase();
  if (!q) return events;

  return events.filter((event) => {
    const haystack = [
      event.actName,
      event.description,
      event.address,
      event.cityName,
      eventCityName(event),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(q);
  });
}
