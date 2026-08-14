import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const EVENT_REMINDER_CHANNEL = 'event-reminders';

export type PushRegistrationResult =
  | { ok: true; token: string }
  | { ok: false; message: string };

export async function ensureNotificationChannels(): Promise<void> {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });

  await Notifications.setNotificationChannelAsync(EVENT_REMINDER_CHANNEL, {
    name: '活動提醒',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

function getProjectId(): string | undefined {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId
  );
}

export async function registerForPushNotificationsAsync(): Promise<PushRegistrationResult> {
  if (!Device.isDevice) {
    return {
      ok: false,
      message: 'Push Notification 需要在實體手機上測試（模擬器不支援）。',
    };
  }

  await ensureNotificationChannels();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return {
      ok: false,
      message: '尚未允許通知權限。請到系統設定開啟通知。',
    };
  }

  const projectId = getProjectId();
  if (!projectId) {
    return {
      ok: false,
      message:
        '找不到 EAS projectId。之後執行 npx eas-cli init，並在 app.json 設定 extra.eas.projectId。',
    };
  }

  const token = (
    await Notifications.getExpoPushTokenAsync({ projectId })
  ).data;

  return { ok: true, token };
}
