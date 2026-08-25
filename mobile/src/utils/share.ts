import { env } from '@/config/env';
import { eventDetailPath } from '@/utils/eventId';

export function getEventShareUrl(eventId: string): string {
  return `${env.apiUrl}${eventDetailPath(eventId)}`;
}
