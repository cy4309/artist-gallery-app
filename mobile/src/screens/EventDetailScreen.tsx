import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getOrgData } from '@/api/org';
import { ApiError } from '@/api/errors';
import EventDetailSlide from '@/components/EventDetailSlide';
import { COPY } from '@/content/copy';
import { colors, space, type } from '@/theme/tokens';
import { OrgEvent } from '@/types/orgEvent';
import { displayCityName, eventCityName } from '@/utils/city';
import { findOrgEventByRouteId } from '@/utils/canonicalToLegacy';
import { loadSessionCategories } from '@/utils/eventCategoryPrefs';
import {
  eventRouteSegment,
  favoriteIdAliases,
  toCanonicalId,
} from '@/utils/eventId';

type Status = 'loading' | 'success' | 'error';

function indexOfRouteId(events: OrgEvent[], rawId: string): number {
  const id = toCanonicalId(rawId);
  if (!id) return -1;
  const aliases = new Set(favoriteIdAliases(id));
  return events.findIndex(
    (item) => aliases.has(item.id) || item.id === id
  );
}

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const listRef = useRef<FlatList<OrgEvent>>(null);
  const syncingFromSwipeRef = useRef(false);

  const [status, setStatus] = useState<Status>('loading');
  const [cityEvents, setCityEvents] = useState<OrgEvent[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async (routeId: string) => {
    try {
      setStatus('loading');
      setErrorMessage('');
      const categories = (await loadSessionCategories()) ?? undefined;
      const events = await getOrgData({
        id: routeId,
        categories,
      });
      const foundIndex = indexOfRouteId(events, routeId);

      if (foundIndex < 0) {
        setCityEvents([]);
        setErrorMessage(COPY.events.notFound);
        setStatus('error');
        return;
      }

      setCityEvents(events);
      setActiveIndex(foundIndex);
      setStatus('success');
    } catch (error) {
      setCityEvents([]);
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(COPY.events.loadError);
      }
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!id) {
      setErrorMessage('找不到活動 ID');
      setStatus('error');
      return;
    }

    const routeId = String(id);

    if (cityEvents.length > 0) {
      const existing = indexOfRouteId(cityEvents, routeId);
      if (existing >= 0) {
        if (existing !== activeIndex) {
          setActiveIndex(existing);
          requestAnimationFrame(() => {
            listRef.current?.scrollToIndex({
              index: existing,
              animated: false,
            });
          });
        }
        return;
      }
    }

    if (syncingFromSwipeRef.current) {
      syncingFromSwipeRef.current = false;
      return;
    }

    void load(routeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to route id / explicit reload
  }, [id, load]);

  const activeEvent = cityEvents[activeIndex] ?? null;
  const cityLabel = useMemo(() => {
    if (!activeEvent) return '';
    return (
      displayCityName(eventCityName(activeEvent) ?? activeEvent.cityName) ||
      activeEvent.cityName
    );
  }, [activeEvent]);

  const positionLabel = useMemo(() => {
    if (!activeEvent || cityEvents.length === 0) return null;
    return COPY.events.listPositionWithCity
      .replace('{city}', cityLabel)
      .replace('{current}', String(activeIndex + 1))
      .replace('{total}', String(cityEvents.length));
  }, [activeEvent, activeIndex, cityEvents.length, cityLabel]);

  const syncRouteId = useCallback(
    (event: OrgEvent) => {
      const segment = eventRouteSegment(event.id);
      if (segment === id) return;
      syncingFromSwipeRef.current = true;
      router.setParams({ id: segment });
    },
    [id]
  );

  const syncRouteIdRef = useRef(syncRouteId);
  syncRouteIdRef.current = syncRouteId;

  const goToIndex = (next: number) => {
    if (next < 0 || next >= cityEvents.length) return;
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setActiveIndex(next);
    syncRouteId(cityEvents[next]);
  };

  const onMomentumScrollEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    if (index < 0 || index >= cityEvents.length) return;
    setActiveIndex(index);
    syncRouteIdRef.current(cityEvents[index]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.heading}>活動詳情</Text>
      </View>

      {status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.border} />
          <Text style={styles.centerText}>載入中…</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>{COPY.events.loadError}</Text>
          <Text style={styles.centerText}>{errorMessage}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => id && load(String(id))}
          >
            <Text style={styles.retryText}>{COPY.events.retry}</Text>
          </Pressable>
        </View>
      )}

      {status === 'success' && cityEvents.length > 0 ? (
        <>
          {cityEvents.length > 1 ? (
            <View style={styles.navRow}>
              <Pressable
                onPress={() => goToIndex(activeIndex - 1)}
                disabled={activeIndex <= 0}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.navBtn,
                  activeIndex <= 0 && styles.navBtnDisabled,
                  pressed && activeIndex > 0 && styles.pressed,
                ]}
              >
                <Text style={styles.navBtnText}>‹ 上一則</Text>
              </Pressable>
              {positionLabel ? (
                <Text style={styles.position}>{positionLabel}</Text>
              ) : (
                <View style={styles.positionSpacer} />
              )}
              <Pressable
                onPress={() => goToIndex(activeIndex + 1)}
                disabled={activeIndex >= cityEvents.length - 1}
                hitSlop={8}
                style={({ pressed }) => [
                  styles.navBtn,
                  activeIndex >= cityEvents.length - 1 && styles.navBtnDisabled,
                  pressed &&
                    activeIndex < cityEvents.length - 1 &&
                    styles.pressed,
                ]}
              >
                <Text style={styles.navBtnText}>下一則 ›</Text>
              </Pressable>
            </View>
          ) : positionLabel ? (
            <Text style={styles.positionSolo}>{positionLabel}</Text>
          ) : null}

          <FlatList
            ref={listRef}
            data={cityEvents}
            keyExtractor={(item) => item.id}
            key={cityLabel || 'peers'}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={
              activeIndex >= 0 && activeIndex < cityEvents.length
                ? activeIndex
                : 0
            }
            getItemLayout={(_, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            onScrollToIndexFailed={(info) => {
              requestAnimationFrame(() => {
                listRef.current?.scrollToIndex({
                  index: info.index,
                  animated: false,
                });
              });
            }}
            renderItem={({ item }) => (
              <EventDetailSlide event={item} width={width} />
            )}
            onMomentumScrollEnd={onMomentumScrollEnd}
          />
        </>
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
    paddingBottom: space.md,
  },
  heading: {
    fontSize: type.heading,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
  },
  position: {
    flex: 1,
    fontSize: type.meta,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: space.sm,
  },
  positionSpacer: {
    flex: 1,
  },
  positionSolo: {
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
    fontSize: type.meta,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    paddingHorizontal: space.xl,
    paddingTop: space.xs,
    paddingBottom: space.lg,
  },
  navBtn: {
    minHeight: 44,
    minWidth: 96,
    paddingVertical: space.md,
    paddingHorizontal: space.lg,
    borderWidth: 2,
    borderColor: colors.borderMuted,
    borderRadius: 10,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnDisabled: {
    opacity: 0.35,
  },
  navBtnText: {
    fontSize: type.body,
    fontWeight: '700',
    color: colors.accentSoft,
  },
  pressed: {
    opacity: 0.85,
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
    marginTop: space.sm,
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
