import { useEffect } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';

import { ensureNotificationChannels } from './registerForPush';

function eventIdFromData(data: Record<string, unknown> | undefined): string | null {
  const value = data?.eventId;
  if (typeof value === 'string' && value) return value;
  if (typeof value === 'number') return String(value);
  return null;
}

export default function NotificationOpenHandler() {
  useEffect(() => {
    void ensureNotificationChannels();

    function openEvent(eventId: string) {
      router.push(`/events/${eventId}`);
    }

    void (async () => {
      const last = await Notifications.getLastNotificationResponseAsync();
      const eventId = eventIdFromData(
        last?.notification.request.content.data as Record<string, unknown> | undefined
      );
      if (eventId) {
        openEvent(eventId);
        await Notifications.clearLastNotificationResponseAsync();
      }
    })();

    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const eventId = eventIdFromData(
        response.notification.request.content.data as Record<string, unknown> | undefined
      );
      if (eventId) openEvent(eventId);
    });

    return () => sub.remove();
  }, []);

  return null;
}
