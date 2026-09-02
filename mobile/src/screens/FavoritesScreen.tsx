import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/auth/AuthContext';
import { fetchFavoriteList, FavoriteRecord } from '@/api/favorites';
import FavoriteEventCard from '@/components/FavoriteEventCard';
import { colors, space, type } from '@/theme/tokens';
import { isEventEnded, sortFavoritesLikeWeb } from '@/utils/favorites';
import { eventRouteSegment, favoritesInclude } from '@/utils/eventId';

export default function FavoritesScreen() {
  const { user, loading: authLoading, favoriteIds } = useAuth();
  const [items, setItems] = useState<FavoriteRecord[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle'
  );

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setStatus('loading');
      const list = await fetchFavoriteList();
      setItems(sortFavoritesLikeWeb(list));
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/');
      return;
    }
    load();
  }, [authLoading, user, load]);

  useEffect(() => {
    setItems((prev) =>
      sortFavoritesLikeWeb(
        prev.filter((item) => favoritesInclude(favoriteIds, String(item.eventId)))
      )
    );
  }, [favoriteIds]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.heading}>收藏</Text>
        {status === 'success' && items.length > 0 ? (
          <Text style={styles.hint}>進行中優先 · 已結束置底</Text>
        ) : null}
      </View>

      {(authLoading || status === 'loading' || status === 'idle') && user ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.border} />
          <Text style={styles.centerText}>載入收藏中…</Text>
        </View>
      ) : null}

      {status === 'error' ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>載入失敗</Text>
          <Pressable style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>再試一次</Text>
          </Pressable>
        </View>
      ) : null}

      {status === 'success' && items.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>還沒有收藏</Text>
          <Text style={styles.centerText}>在活動頁點愛心即可加入</Text>
        </View>
      ) : null}

      {status === 'success' && items.length > 0 ? (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.eventId)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <FavoriteEventCard
              item={item}
              ended={isEventEnded(item.eventEndDate)}
              onPress={() =>
                router.push(`/events/${eventRouteSegment(String(item.eventId))}`)
              }
            />
          )}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.lg,
    gap: space.xs,
  },
  heading: {
    fontSize: type.heading,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
  },
  hint: {
    fontSize: type.caption,
    color: colors.textDim,
  },
  list: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.xxxl,
    gap: space.xl,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.xxl,
    gap: space.md,
  },
  centerText: {
    fontSize: type.meta,
    color: colors.textMuted,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: type.heading,
    fontWeight: '600',
    color: colors.text,
  },
  retryButton: {
    backgroundColor: colors.text,
    borderRadius: 8,
    paddingHorizontal: space.xl,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.bg,
    fontSize: type.meta,
    fontWeight: '600',
  },
});
