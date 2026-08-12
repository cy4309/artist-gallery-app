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
};

export async function registerPushToken(
  payload: RegisterPushTokenPayload
): Promise<RegisterPushTokenResponse> {
  return apiPost<RegisterPushTokenResponse>('/api/push/register', payload);
}
