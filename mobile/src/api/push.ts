import { apiPost } from './client';

export type PushPlatform = 'ios' | 'android';

export type RegisterPushTokenPayload = {
  userId?: string;
  expoPushToken: string;
  platform: PushPlatform;
};

export type RegisterPushTokenResponse = {
  success: boolean;
  created?: boolean;
  stub?: boolean;
  error?: string;
};

export type SendTestPushPayload = {
  expoPushToken: string;
  title?: string;
  body?: string;
};

export type SendTestPushResponse = {
  success: boolean;
  ticketId?: string;
  error?: string;
};

export async function registerPushToken(
  payload: RegisterPushTokenPayload
): Promise<RegisterPushTokenResponse> {
  // GAS Web App 常偏慢（冷啟動），15s 容易在寫入成功後才 timeout
  return apiPost<RegisterPushTokenResponse>('/api/push/register', payload, {
    timeoutMs: 45_000,
  });
}

export async function sendTestPush(
  payload: SendTestPushPayload
): Promise<SendTestPushResponse> {
  return apiPost<SendTestPushResponse>('/api/push/send', payload, {
    timeoutMs: 45_000,
  });
}
