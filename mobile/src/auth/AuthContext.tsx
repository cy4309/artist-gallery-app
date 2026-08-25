import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { router } from 'expo-router';

import {
  ensureFavorite,
  fetchFavoriteList,
  toggleFavorite,
  FavoriteExtra,
} from '@/api/favorites';
import { ApiError } from '@/api/errors';
import {
  cancelAllEventReminders,
  onEventFavorited,
  onEventUnfavorited,
  syncEventReminders,
} from '@/notifications/eventReminders';
import { User } from '@/types/user';
import {
  clearUser,
  loadStoredUser,
  saveUser,
} from './session';
import {
  favoritesInclude,
  findStoredFavoriteId,
} from '@/utils/eventId';

type PendingFavorite = {
  eventId: string;
  extra?: FavoriteExtra;
};

let pendingFavorite: PendingFavorite | null = null;

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  favoriteIds: string[];
  completeLogin: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  requireLogin: () => boolean;
  startLoginToFavorite: (eventId: string, extra?: FavoriteExtra) => void;
  cancelPendingFavorite: () => void;
  toggleFavoriteForEvent: (
    eventId: string,
    extra?: FavoriteExtra
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const reloadFavorites = useCallback(async (userId?: string) => {
    try {
      const list = await fetchFavoriteList();
      setFavoriteIds(list.map((item) => String(item.eventId)));
      await syncEventReminders(
        list.map((item) => ({
          eventId: String(item.eventId),
          eventTitle: item.eventTitle,
          eventStartDate: item.eventStartDate,
        })),
        userId
      );
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  const completeLogin = useCallback(
    async (nextUser: User) => {
      await saveUser(nextUser);
      setUser(nextUser);

      const pending = pendingFavorite;
      pendingFavorite = null;
      if (pending) {
        try {
          await ensureFavorite(pending.eventId, pending.extra);
          setFavoriteIds((prev) =>
            prev.includes(pending.eventId)
              ? prev
              : [...prev, pending.eventId]
          );
          await onEventFavorited(
            {
              eventId: pending.eventId,
              eventTitle: pending.extra?.eventTitle,
              eventStartDate: pending.extra?.eventStartDate,
            },
            nextUser.id
          );
        } catch {
          // 登入已成功；收藏失敗時使用者可再按一次
        }
      }

      await reloadFavorites(nextUser.id);
    },
    [reloadFavorites]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await loadStoredUser();
      if (cancelled) return;
      setUser(stored);
      if (stored) {
        await reloadFavorites(stored.id);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadFavorites]);

  const logout = useCallback(async () => {
    await clearUser();
    setUser(null);
    setFavoriteIds([]);
    await cancelAllEventReminders();
  }, []);

  const startLoginToFavorite = useCallback(
    (eventId: string, extra?: FavoriteExtra) => {
      pendingFavorite = { eventId, extra };
      router.push('/login');
    },
    []
  );

  const cancelPendingFavorite = useCallback(() => {
    pendingFavorite = null;
  }, []);

  const requireLogin = useCallback(() => {
    if (user) return true;
    router.push('/login');
    return false;
  }, [user]);

  const toggleFavoriteForEvent = useCallback(
    async (eventId: string, extra?: FavoriteExtra) => {
      if (!user) {
        startLoginToFavorite(eventId, extra);
        return;
      }

      const wasFavorite = Boolean(findStoredFavoriteId(favoriteIds, eventId));
      setFavoriteIds((prev) => {
        const stored = findStoredFavoriteId(prev, eventId);
        if (wasFavorite && stored) {
          return prev.filter((id) => id !== stored);
        }
        if (!wasFavorite) {
          return prev.includes(eventId) ? prev : [...prev, eventId];
        }
        return prev;
      });

      try {
        await toggleFavorite(eventId, extra);
        if (wasFavorite) {
          await onEventUnfavorited(eventId);
        } else {
          await onEventFavorited(
            {
              eventId,
              eventTitle: extra?.eventTitle,
              eventStartDate: extra?.eventStartDate,
            },
            user.id
          );
        }
      } catch (error) {
        setFavoriteIds((prev) =>
          wasFavorite
            ? [...prev, findStoredFavoriteId(prev, eventId) ?? eventId]
            : prev.filter((id) => !favoritesInclude([id], eventId))
        );
        if (error instanceof ApiError && error.status === 401) {
          pendingFavorite = { eventId, extra };
          await logout();
          router.push('/login');
        }
      }
    },
    [favoriteIds, logout, startLoginToFavorite, user]
  );

  const value = useMemo(
    () => ({
      user,
      loading,
      favoriteIds,
      completeLogin,
      logout,
      requireLogin,
      startLoginToFavorite,
      cancelPendingFavorite,
      toggleFavoriteForEvent,
    }),
    [
      user,
      loading,
      favoriteIds,
      completeLogin,
      logout,
      requireLogin,
      startLoginToFavorite,
      cancelPendingFavorite,
      toggleFavoriteForEvent,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
