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

import { useAuth } from '../auth/AuthContext';
import { fetchFavoriteList, FavoriteRecord } from '../api/favorites';
import FavoriteButton from '../components/FavoriteButton';
import { colors, radius, space, type } from '../theme/tokens';
import { formatEventDateRange } from '../utils/formatDate';
import { isEventEnded, sortFavoritesLikeWeb } from '../utils/favorites';

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
        prev.filter((item) => favoriteIds.includes(String(item.eventId)))
      )
    );
  }, [favoriteIds]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>← 返回</Text>
        </Pressable>
        <Text style={styles.heading}>收藏</Text>
        <View style={styles.headerSpacer} />
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
          renderItem={({ item }) => {
            const ended = isEventEnded(item.eventEndDate);
            return (
              <Pressable
                style={[styles.card, ended && styles.cardEnded]}
                onPress={() => router.push(`/events/${item.eventId}`)}
              >
                <View style={styles.cardHeader}>
                  <Text
                    style={[styles.cardTitle, ended && styles.textEnded]}
                    numberOfLines={2}
                  >
                    {item.eventTitle}
                  </Text>
                  <FavoriteButton
                    eventId={String(item.eventId)}
                    extra={{
                      eventTitle: item.eventTitle,
                      eventStartDate: item.eventStartDate,
                      eventEndDate: item.eventEndDate,
                      eventLocation: item.eventLocation,
                      eventUrl: item.eventUrl,
                      imageUrl: item.imageUrl,
                    }}
                  />
                </View>
                {ended ? <Text style={styles.endedBadge}>已結束</Text> : null}
                <Text style={[styles.meta, ended && styles.textEnded]}>
                  {formatEventDateRange(item.eventStartDate, item.eventEndDate)}
                </Text>
                {item.eventLocation ? (
                  <Text
                    style={[styles.meta, ended && styles.textEnded]}
                    numberOfLines={1}
                  >
                    {item.eventLocation}
                  </Text>
                ) : null}
              </Pressable>
            );
          }}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    paddingBottom: space.md,
  },
  back: {
    fontSize: type.body,
    color: colors.text,
    width: 72,
  },
  heading: {
    fontSize: type.heading,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
  },
  headerSpacer: {
    width: 72,
  },
  list: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxxl,
    gap: space.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: space.lg,
    gap: space.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: space.md,
  },
  cardTitle: {
    flex: 1,
    fontSize: type.body,
    fontWeight: '700',
    color: colors.text,
  },
  cardEnded: {
    opacity: 0.55,
    borderColor: colors.borderMuted,
  },
  textEnded: {
    color: colors.textDim,
  },
  endedBadge: {
    alignSelf: 'flex-start',
    fontSize: type.caption,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textDim,
  },
  meta: {
    fontSize: type.caption,
    color: colors.textMuted,
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
