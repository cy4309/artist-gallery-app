import * as SecureStore from 'expo-secure-store';

import {
  ALL_EVENT_CATEGORY_IDS,
  EventCategoryId,
  isAllCategories,
  normalizeCategoryList,
} from './eventCategories';

const KEY = 'cyc-event-categories';
const PREFS_VERSION = 2;

type StoredCategoryPrefs = {
  v: number;
  ids: EventCategoryId[];
};

export async function loadSessionCategories(): Promise<EventCategoryId[] | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as unknown;

    if (Array.isArray(parsed)) {
      const ids = normalizeCategoryList(parsed);
      if (ids.length === 0 || isAllCategories(ids)) {
        await SecureStore.deleteItemAsync(KEY);
        return null;
      }
      await saveSessionCategories(ids);
      return ids;
    }

    if (
      parsed &&
      typeof parsed === 'object' &&
      'ids' in parsed &&
      Array.isArray((parsed as StoredCategoryPrefs).ids)
    ) {
      const prefs = parsed as StoredCategoryPrefs;
      const ids = normalizeCategoryList(prefs.ids);
      if (ids.length === 0) return null;
      if (prefs.v !== PREFS_VERSION) {
        await saveSessionCategories(ids);
      }
      return ids;
    }

    return null;
  } catch {
    return null;
  }
}

export async function saveSessionCategories(
  categories: EventCategoryId[]
): Promise<void> {
  const normalized = normalizeCategoryList(categories);
  if (normalized.length === 0) return;
  const payload: StoredCategoryPrefs = { v: PREFS_VERSION, ids: normalized };
  await SecureStore.setItemAsync(KEY, JSON.stringify(payload));
}

export async function clearSessionCategories(): Promise<void> {
  await SecureStore.deleteItemAsync(KEY);
}

export { ALL_EVENT_CATEGORY_IDS };
