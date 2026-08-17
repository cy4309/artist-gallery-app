import { env } from '@/config/env';

export function getEventShareUrl(actId: number | string): string {
  return `${env.apiUrl}/events/${actId}`;
}
