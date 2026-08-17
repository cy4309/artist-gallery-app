import { Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

import { registerPushToken } from '@/api/push';
import { reminderFireAt } from './eventReminderTime';
import {
  loadEventRemindersEnabled,
  loadInstantFavoriteNotify,
  loadSoftPromptSeen,
  saveEventRemindersEnabled,
  saveInstantFavoriteNotify,
  saveSoftPromptSeen,
} from './prefs';
import {
  EVENT_REMINDER_CHANNEL,
  registerForPushNotificationsAsync,
} from './registerForPush';

const ID_PREFIX = 'event-reminder:';

export type ReminderEvent = {
  eventId: string;
  eventTitle?: string;
  eventStartDate?: string;
};

export function eventReminderId(eventId: string): string {
  return `${ID_PREFIX}${eventId}`;
}

export async function cancelEventReminder(eventId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(eventReminderId(eventId));
}

export async function cancelAllEventReminders(): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter((item) => item.identifier.startsWith(ID_PREFIX))
      .map((item) =>
        Notifications.cancelScheduledNotificationAsync(item.identifier)
      )
  );
}

async function registerTokenQuietly(userId?: string): Promise<void> {
  const result = await registerForPushNotificationsAsync();
  if (!result.ok) return;

  try {
    await registerPushToken({
      expoPushToken: result.token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      userId,
    });
  } catch {
    // 本機排程仍可運作
  }
}

async function fireInstantTestNotification(item: ReminderEvent): Promise<void> {
  const title = item.eventTitle?.trim() || '你收藏的活動';
  await Notifications.scheduleNotificationAsync({
    identifier: `event-reminder-test:${item.eventId}:${Date.now()}`,
    content: {
      title: '【測試】已收藏活動',
      body: title,
      data: { eventId: item.eventId },
    },
    trigger: null,
  });
}

async function fireInstantIfTesting(item: ReminderEvent): Promise<void> {
  if (await loadInstantFavoriteNotify()) {
    await fireInstantTestNotification(item);
  }
}

async function scheduleOne(item: ReminderEvent): Promise<void> {
  const fireAt = reminderFireAt(item.eventStartDate);
  if (!fireAt) {
    await cancelEventReminder(item.eventId);
    return;
  }

  const title = item.eventTitle?.trim() || '你收藏的活動';
  await Notifications.scheduleNotificationAsync({
    identifier: eventReminderId(item.eventId),
    content: {
      title: '明天有你收藏的活動',
      body: title,
      data: { eventId: item.eventId },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: fireAt,
      channelId: EVENT_REMINDER_CHANNEL,
    },
  });
}

export async function syncEventReminders(
  items: ReminderEvent[],
  userId?: string
): Promise<void> {
  const enabled = await loadEventRemindersEnabled();
  const permission = await Notifications.getPermissionsAsync();

  if (!enabled || permission.status !== 'granted') {
    await cancelAllEventReminders();
    return;
  }

  await registerTokenQuietly(userId);

  const wanted = new Set(
    items.filter((item) => reminderFireAt(item.eventStartDate)).map((item) => item.eventId)
  );

  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(
        (item) =>
          item.identifier.startsWith(ID_PREFIX) &&
          !wanted.has(item.identifier.slice(ID_PREFIX.length))
      )
      .map((item) =>
        Notifications.cancelScheduledNotificationAsync(item.identifier)
      )
  );

  for (const item of items) {
    await scheduleOne(item);
  }
}

async function requestAndSchedule(
  item: ReminderEvent,
  userId?: string
): Promise<void> {
  const result = await registerForPushNotificationsAsync();
  if (!result.ok) return;

  try {
    await registerPushToken({
      expoPushToken: result.token,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
      userId,
    });
  } catch {
    // 本機排程仍可運作
  }

  const enabled = await loadEventRemindersEnabled();
  if (enabled && reminderFireAt(item.eventStartDate)) {
    await scheduleOne(item);
  }
  await fireInstantIfTesting(item);
}

export async function onEventFavorited(
  item: ReminderEvent,
  userId?: string
): Promise<void> {
  const enabled = await loadEventRemindersEnabled();
  const testing = await loadInstantFavoriteNotify();
  const canSchedule = Boolean(reminderFireAt(item.eventStartDate));
  if (!enabled && !testing) return;
  if (!testing && !canSchedule) return;

  const permission = await Notifications.getPermissionsAsync();
  if (permission.status === 'granted') {
    await registerTokenQuietly(userId);
    if (enabled && canSchedule) await scheduleOne(item);
    await fireInstantIfTesting(item);
    return;
  }

  if (permission.status === 'denied') return;

  const seen = await loadSoftPromptSeen();
  if (seen) return;

  Alert.alert(
    '活動提醒',
    testing
      ? '測試模式：收藏後會立刻通知。正式提醒仍是活動開始前一天上午 9 點。'
      : '收藏後，我們會在活動開始前一天上午 9 點（台灣時間）提醒你。',
    [
      {
        text: '暫時不要',
        style: 'cancel',
        onPress: () => {
          void saveSoftPromptSeen();
        },
      },
      {
        text: '開啟提醒',
        onPress: () => {
          void (async () => {
            await saveSoftPromptSeen();
            await requestAndSchedule(item, userId);
          })();
        },
      },
    ]
  );
}

export async function setInstantFavoriteNotify(
  enabled: boolean,
  userId?: string
): Promise<void> {
  await saveInstantFavoriteNotify(enabled);
  if (!enabled) return;
  await saveSoftPromptSeen();
  await registerForPushNotificationsAsync();
  await registerTokenQuietly(userId);
}

export async function onEventUnfavorited(eventId: string): Promise<void> {
  await cancelEventReminder(eventId);
}

export async function setEventRemindersEnabled(
  enabled: boolean,
  items: ReminderEvent[],
  userId?: string
): Promise<void> {
  await saveEventRemindersEnabled(enabled);
  if (!enabled) {
    await cancelAllEventReminders();
    return;
  }

  await saveSoftPromptSeen();
  const result = await registerForPushNotificationsAsync();
  if (!result.ok) {
    await cancelAllEventReminders();
    return;
  }

  await syncEventReminders(items, userId);
}
