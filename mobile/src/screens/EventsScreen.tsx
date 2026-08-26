import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getOrgData } from '@/api/org';
import { ApiError } from '@/api/errors';
import CityPicker, { ALL_CITIES } from '@/components/CityPicker';
import EventCard from '@/components/EventCard';
import EventCategoryPicker from '@/components/EventCategoryPicker';
import {
  EventSearchPanel,
  EventSearchTrigger,
} from '@/components/EventSearchBar';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import { colors, space, type } from '@/theme/tokens';
import { OrgEvent } from '@/types/orgEvent';
import { CITY_ORDER } from '@/utils/city';
import { filterEventsByKeyword } from '@/utils/eventSearch';
import { EventCategoryId } from '@/utils/eventCategories';
import {
  loadSessionCategories,
  saveSessionCategories,
} from '@/utils/eventCategoryPrefs';
import { eventRouteSegment } from '@/utils/eventId';

const SCROLL_TOP_THRESHOLD = 480;

export default function EventsScreen() {
  const listRef = useRef<FlatList<OrgEvent>>(null);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [selectedCity, setSelectedCity] = useState(ALL_CITIES);
  const [pickingCategories, setPickingCategories] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState<
    EventCategoryId[]
  >([]);
  const [hasSavedCategories, setHasSavedCategories] = useState(false);
  const [orgData, setOrgData] = useState<OrgEvent[]>([]);
  const [orgLoading, setOrgLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [catalog, setCatalog] = useState<OrgEvent[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogReady, setCatalogReady] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const cities = useMemo(() => [...CITY_ORDER], []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const saved = await loadSessionCategories();
      if (cancelled) return;
      if (saved && saved.length > 0) {
        setSelectedCategories(saved);
        setHasSavedCategories(true);
        setPickingCategories(false);
      } else {
        setSelectedCategories([]);
        setHasSavedCategories(false);
        setPickingCategories(true);
      }
      setBootstrapped(true);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const searchResults = useMemo(
    () => filterEventsByKeyword(catalog, searchQuery),
    [catalog, searchQuery]
  );

  const cityFiltered = useMemo(
    () => filterEventsByKeyword(orgData, searchQuery),
    [orgData, searchQuery]
  );

  const hasSearch = searchQuery.trim().length > 0;
  const listEvents = hasSearch ? searchResults : cityFiltered;

  const resolveCategories = useCallback(async (): Promise<EventCategoryId[]> => {
    if (selectedCategories.length > 0) return selectedCategories;
    return (await loadSessionCategories()) ?? [];
  }, [selectedCategories]);

  const loadEvents = useCallback(
    async (city: string, categories: EventCategoryId[]) => {
      try {
        setOrgLoading(true);
        setErrorMessage('');
        setPickingCategories(false);
        const events = await getOrgData({
          city: city === ALL_CITIES ? undefined : city,
          categories,
        });
        setOrgData(events);
        setHasConfirmed(true);
      } catch (error) {
        if (error instanceof ApiError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('載入失敗');
        }
        setOrgData([]);
        setHasConfirmed(true);
      } finally {
        setOrgLoading(false);
      }
    },
    []
  );

  const ensureCatalog = useCallback(async () => {
    if (catalogReady || catalogLoading) return catalog;

    try {
      setCatalogLoading(true);
      const events = await getOrgData();
      setCatalog(events);
      setCatalogReady(true);
      return events;
    } catch {
      setCatalog([]);
      setCatalogReady(false);
      return [];
    } finally {
      setCatalogLoading(false);
    }
  }, [catalog, catalogLoading, catalogReady]);

  const toggleSearch = () => {
    setSearchOpen((open) => {
      const next = !open;
      if (!next) setSearchQuery('');
      else void ensureCatalog();
      return next;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) void ensureCatalog();
  };

  const handleSelectCity = async (city: string) => {
    const categories = await resolveCategories();
    if (categories.length === 0) {
      setPickingCategories(true);
      return;
    }

    setSelectedCity(city);
    setHasConfirmed(false);
    setOrgData([]);
    setSearchQuery('');
    setShowScrollTop(false);
    void loadEvents(city, categories);
  };

  const handleCancelPick = () => {
    if (hasSavedCategories) {
      setPickingCategories(false);
    }
  };

  const handleConfirmCategories = async (categories: EventCategoryId[]) => {
    if (categories.length === 0) return;
    setSelectedCategories(categories);
    await saveSessionCategories(categories);
    setHasSavedCategories(true);
    setPickingCategories(false);

    if (hasConfirmed) {
      await loadEvents(selectedCity, categories);
    }
  };

  const handleChangeCategories = async () => {
    const saved = await loadSessionCategories();
    setSelectedCategories(saved && saved.length > 0 ? saved : []);
    setPickingCategories(true);
    setSearchQuery('');
    setSearchOpen(false);
    setShowScrollTop(false);
  };

  const onListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowScrollTop(event.nativeEvent.contentOffset.y > SCROLL_TOP_THRESHOLD);
  };

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    setShowScrollTop(false);
  };

  if (!bootstrapped) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar style="light" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.border} />
        </View>
      </SafeAreaView>
    );
  }

  if (pickingCategories && !hasSearch) {
    return (
      <>
        <StatusBar style="light" />
        <EventCategoryPicker
          selected={selectedCategories}
          onChange={setSelectedCategories}
          onConfirm={handleConfirmCategories}
          onCancel={handleCancelPick}
          loading={orgLoading}
          confirmLoadsData={hasConfirmed}
          allowCancel={hasSavedCategories}
        />
      </>
    );
  }

  if (orgLoading || (hasSearch && catalogLoading)) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar style="light" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.border} />
          <Text style={styles.centerText}>載入活動中…</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.heading}>活動</Text>
        <View style={styles.headerRight}>
          {hasSavedCategories || hasConfirmed || hasSearch ? (
            <Pressable onPress={handleChangeCategories} hitSlop={8}>
              <Text style={styles.changeType}>變更類型</Text>
            </Pressable>
          ) : null}
          <Text style={styles.count}>
            {hasConfirmed || hasSearch ? `${listEvents.length} 筆` : ' '}
          </Text>
          <EventSearchTrigger expanded={searchOpen} onToggle={toggleSearch} />
        </View>
      </View>

      <EventSearchPanel
        expanded={searchOpen}
        value={searchQuery}
        onChange={handleSearchChange}
      />

      {!hasSearch && (
        <CityPicker
          cities={cities}
          selected={selectedCity}
          onSelect={handleSelectCity}
        />
      )}

      {!hasSearch && !hasConfirmed && (
        <View style={styles.center}>
          <Text style={styles.promptTitle}>選擇縣市開始瀏覽</Text>
          <Text style={styles.centerText}>
            也可直接用上方搜尋；請先確認活動類型再選縣市
          </Text>
        </View>
      )}

      {!hasSearch && hasConfirmed && errorMessage ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>載入失敗</Text>
          <Text style={styles.centerText}>{errorMessage}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => loadEvents(selectedCity, selectedCategories)}
          >
            <Text style={styles.retryText}>再試一次</Text>
          </Pressable>
        </View>
      ) : null}

      {!hasSearch && hasConfirmed && !errorMessage && orgData.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>目前沒有符合的活動</Text>
          <Text style={styles.centerText}>試試其他縣市或變更類型</Text>
        </View>
      )}

      {!hasSearch &&
        hasConfirmed &&
        !errorMessage &&
        orgData.length > 0 &&
        listEvents.length === 0 && (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>沒有符合的活動</Text>
            <Text style={styles.centerText}>試試調整搜尋關鍵字</Text>
          </View>
        )}

      {hasSearch && listEvents.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>找不到符合的活動</Text>
          <Text style={styles.centerText}>試試其他關鍵字或縣市</Text>
        </View>
      )}

      {listEvents.length > 0 && (hasSearch || hasConfirmed) && (
        <FlatList
          ref={listRef}
          data={listEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() =>
                router.push(`/events/${eventRouteSegment(item.id)}`)
              }
            />
          )}
          contentContainerStyle={styles.list}
          onScroll={onListScroll}
          scrollEventThrottle={16}
        />
      )}

      <ScrollToTopButton visible={showScrollTop} onPress={scrollToTop} />
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
    paddingTop: space.lg,
    paddingBottom: space.lg,
  },
  heading: {
    fontSize: type.heading,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  changeType: {
    fontSize: type.caption,
    fontWeight: '600',
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
  count: {
    fontSize: type.meta,
    color: colors.textMuted,
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
  promptTitle: {
    fontSize: type.heading,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
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
