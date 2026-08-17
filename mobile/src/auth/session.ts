import * as SecureStore from 'expo-secure-store';

import { User } from '@/types/user';

const USER_KEY = 'cyc_user';

let memoryUser: User | null = null;

export function getMemoryUser(): User | null {
  return memoryUser;
}

export function setMemoryUser(user: User | null) {
  memoryUser = user;
}

export function getSessionCookieHeader(): Record<string, string> {
  if (!memoryUser) return {};
  return {
    Cookie: `cyc_session=${encodeURIComponent(JSON.stringify(memoryUser))}`,
  };
}

export async function loadStoredUser(): Promise<User | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) {
    memoryUser = null;
    return null;
  }
  try {
    const user = JSON.parse(raw) as User;
    memoryUser = user;
    return user;
  } catch {
    memoryUser = null;
    return null;
  }
}

export async function saveUser(user: User): Promise<void> {
  memoryUser = user;
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function clearUser(): Promise<void> {
  memoryUser = null;
  await SecureStore.deleteItemAsync(USER_KEY);
}
