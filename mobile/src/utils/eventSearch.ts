import { OrgEvent } from '@/types/orgEvent';
import { eventCityName } from './city';
import {
  EventDateFilter,
  filterEventsByDateRange,
  hasEventDateFilter,
} from './eventDateFilter';

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

export function hasKeywordSearch(query?: string): boolean {
  return Boolean(query?.trim());
}

export function filterEvents(
  events: OrgEvent[],
  options: { query?: string; date?: EventDateFilter }
): OrgEvent[] {
  let list = events;
  if (options.query?.trim()) {
    list = filterEventsByKeyword(list, options.query);
  }
  if (options.date && hasEventDateFilter(options.date)) {
    list = filterEventsByDateRange(list, options.date);
  }
  return list;
}
