import * as SecureStore from 'expo-secure-store';

const ENABLED_KEY = 'event_reminders_enabled';
const SOFT_PROMPT_KEY = 'event_reminders_soft_prompt_seen';

export async function loadEventRemindersEnabled(): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(ENABLED_KEY);
  if (raw === '0') return false;
  return true;
}

export async function saveEventRemindersEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(ENABLED_KEY, enabled ? '1' : '0');
}

export async function loadSoftPromptSeen(): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(SOFT_PROMPT_KEY);
  return raw === '1';
}

export async function saveSoftPromptSeen(): Promise<void> {
  await SecureStore.setItemAsync(SOFT_PROMPT_KEY, '1');
}

const INSTANT_KEY = 'event_reminders_instant_test';

export async function loadInstantFavoriteNotify(): Promise<boolean> {
  const raw = await SecureStore.getItemAsync(INSTANT_KEY);
  return raw === '1';
}

export async function saveInstantFavoriteNotify(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(INSTANT_KEY, enabled ? '1' : '0');
}
