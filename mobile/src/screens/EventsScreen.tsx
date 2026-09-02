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
import BackButton from '@/components/BackButton';
import CityPicker, { ALL_CITIES, NO_CITY_SELECTED } from '@/components/CityPicker';
import EventCard from '@/components/EventCard';
import EventCategoryPicker from '@/components/EventCategoryPicker';
import {
  EventAdvancedSearchPanel,
  EventAdvancedSearchTrigger,
  EventSearchInline,
  EventSearchTrigger,
} from '@/components/EventSearchBar';
import ScrollToTopButton from '@/components/ScrollToTopButton';
import { colors, space, type } from '@/theme/tokens';
import { OrgEvent } from '@/types/orgEvent';
import { CITY_ORDER, displayCityName } from '@/utils/city';
import { hasEventDateFilter } from '@/utils/eventDateFilter';
import { filterEvents, hasKeywordSearch } from '@/utils/eventSearch';
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
  const [selectedCity, setSelectedCity] = useState(NO_CITY_SELECTED);
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
  const [keywordOpen, setKeywordOpen] = useState(false);
  const [draftDateFrom, setDraftDateFrom] = useState('');
  const [draftDateTo, setDraftDateTo] = useState('');
  const [appliedDateFrom, setAppliedDateFrom] = useState('');
  const [appliedDateTo, setAppliedDateTo] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
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

  const dateFilter = useMemo(
    () => ({ from: appliedDateFrom, to: appliedDateTo }),
    [appliedDateFrom, appliedDateTo]
  );

  const dateDraftDirty =
    draftDateFrom !== appliedDateFrom || draftDateTo !== appliedDateTo;

  const clearDateFilters = useCallback(() => {
    setDraftDateFrom('');
    setDraftDateTo('');
    setAppliedDateFrom('');
    setAppliedDateTo('');
  }, []);

  const hasKeyword = hasKeywordSearch(searchQuery);
  const hasDateFilter = hasEventDateFilter(dateFilter);
  const showCityBrowse = hasConfirmed && !hasKeyword;

  const keywordResults = useMemo(
    () => filterEvents(catalog, { query: searchQuery }),
    [catalog, searchQuery]
  );

  const browseResults = useMemo(
    () => filterEvents(orgData, { date: dateFilter }),
    [orgData, dateFilter]
  );

  const listEvents = hasKeyword ? keywordResults : browseResults;

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

  const toggleKeyword = () => {
    setKeywordOpen((open) => {
      const next = !open;
      if (!next) setSearchQuery('');
      if (next) {
        setAdvancedOpen(false);
        void ensureCatalog();
      }
      return next;
    });
  };

  const toggleAdvanced = () => {
    setAdvancedOpen((open) => {
      const next = !open;
      if (next) {
        setDraftDateFrom(appliedDateFrom);
        setDraftDateTo(appliedDateTo);
        setKeywordOpen(false);
        setSearchQuery('');
      }
      return next;
    });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) void ensureCatalog();
  };

  const handleConfirmDates = () => {
    setAppliedDateFrom(draftDateFrom);
    setAppliedDateTo(draftDateTo);
  };

  const handleBackToCitySelect = () => {
    setHasConfirmed(false);
    setSelectedCity(NO_CITY_SELECTED);
    setOrgData([]);
    clearDateFilters();
    setAdvancedOpen(false);
    setShowScrollTop(false);
    setErrorMessage('');
  };

  const handleSelectCity = async (city: string) => {
    const categories = await resolveCategories();
    if (categories.length === 0) {
      setPickingCategories(true);
      return;
    }

    setSelectedCity(city);
    setSearchQuery('');
    clearDateFilters();
    setKeywordOpen(false);
    setAdvancedOpen(false);
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

    if (hasConfirmed && selectedCity) {
      await loadEvents(selectedCity, categories);
    }
  };

  const handleChangeCategories = async () => {
    const saved = await loadSessionCategories();
    setSelectedCategories(saved && saved.length > 0 ? saved : []);
    setHasConfirmed(false);
    setSelectedCity(NO_CITY_SELECTED);
    setOrgData([]);
    setPickingCategories(true);
    setSearchQuery('');
    clearDateFilters();
    setKeywordOpen(false);
    setAdvancedOpen(false);
    setShowScrollTop(false);
    setErrorMessage('');
  };

  const onListScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setShowScrollTop(event.nativeEvent.contentOffset.y > SCROLL_TOP_THRESHOLD);
  };

  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    setShowScrollTop(false);
  };

  const cityLabel =
    selectedCity === ALL_CITIES
      ? ALL_CITIES
      : displayCityName(selectedCity) || selectedCity;

  const headerChangeCategories = (
    <Pressable onPress={handleChangeCategories} hitSlop={8}>
      <Text style={styles.changeType}>變更類型</Text>
    </Pressable>
  );

  const keywordSearchControls = (showChangeCategories = true) => (
    <>
      <View style={styles.searchRow}>
        <EventSearchTrigger expanded={keywordOpen} onToggle={toggleKeyword} />
        <EventSearchInline
          expanded={keywordOpen}
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </View>
      <View style={styles.headerRight}>
        {hasKeyword ? (
          <Text style={styles.count}>{`${listEvents.length} 筆`}</Text>
        ) : null}
        {showChangeCategories ? headerChangeCategories : null}
      </View>
    </>
  );

  const keywordSearchHint =
    keywordOpen && !hasKeyword ? (
      <Text style={styles.searchHint}>
        輸入關鍵字搜尋全站活動；與縣市瀏覽互斥
      </Text>
    ) : null;

  const renderEventList = () => (
    <FlatList
      ref={listRef}
      data={listEvents}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <EventCard
          event={item}
          onPress={() => router.push(`/events/${eventRouteSegment(item.id)}`)}
        />
      )}
      contentContainerStyle={styles.list}
      onScroll={onListScroll}
      scrollEventThrottle={16}
    />
  );

  const renderInlineLoading = (message: string) => (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.border} />
      <Text style={styles.centerText}>{message}</Text>
    </View>
  );

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

  if (pickingCategories && !hasKeyword) {
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

  // 縣市載入中（非搜尋模式）— 此時無輸入框，全屏 loading 可接受
  if (orgLoading && !hasKeyword) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar style="light" />
        {renderInlineLoading('載入活動中…')}
      </SafeAreaView>
    );
  }

  // 縣市列表模式：獨立 header（返回 + 進階篩選）
  if (showCityBrowse) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <BackButton onPress={handleBackToCitySelect} />
          <View style={styles.headerRight}>
            {headerChangeCategories}
            <EventAdvancedSearchTrigger
              expanded={advancedOpen}
              onToggle={toggleAdvanced}
              active={hasDateFilter}
            />
            <Text style={styles.count}>{`${listEvents.length} 筆`}</Text>
          </View>
        </View>

        <EventAdvancedSearchPanel
          expanded={advancedOpen}
          dateFrom={draftDateFrom}
          dateTo={draftDateTo}
          onDateFromChange={setDraftDateFrom}
          onDateToChange={setDraftDateTo}
          onConfirmDates={handleConfirmDates}
          confirmDatesDisabled={!dateDraftDirty}
          onClearDates={clearDateFilters}
          dateHint={`${cityLabel} · 篩選與活動期間重疊的項目`}
        />

        {errorMessage ? (
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

        {!errorMessage && orgData.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>目前沒有符合的活動</Text>
            <Text style={styles.centerText}>
              {cityLabel} · 試試其他縣市或變更類型
            </Text>
          </View>
        ) : null}

        {!errorMessage &&
        orgData.length > 0 &&
        listEvents.length === 0 &&
        hasDateFilter ? (
          <View style={styles.center}>
            <Text style={styles.errorTitle}>沒有符合日期的活動</Text>
            <Text style={styles.centerText}>試試調整日期區間或清除篩選</Text>
          </View>
        ) : null}

        {!errorMessage && listEvents.length > 0 ? renderEventList() : null}
        <ScrollToTopButton visible={showScrollTop} onPress={scrollToTop} />
      </SafeAreaView>
    );
  }

  // 合併布局：選縣市 + 關鍵字搜尋共用同一頂部搜尋列，輸入框不因 hasKeyword 切換而卸載
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        {hasConfirmed && hasKeyword ? (
          <BackButton
            onPress={() => {
              setSearchQuery('');
              setKeywordOpen(false);
            }}
          />
        ) : (
          <Text style={styles.heading}>活動</Text>
        )}
        <View style={styles.headerMain}>{keywordSearchControls(!hasConfirmed)}</View>
      </View>

      {keywordSearchHint}

      {hasKeyword ? (
        catalogLoading && !catalogReady ? (
          renderInlineLoading('搜尋活動中…')
        ) : listEvents.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.promptTitle}>找不到符合的活動</Text>
            <Text style={styles.centerText}>試試其他關鍵字</Text>
          </View>
        ) : (
          renderEventList()
        )
      ) : (
        <>
          <CityPicker
            cities={cities}
            selected={selectedCity}
            onSelect={handleSelectCity}
            placeholder="請選擇縣市…"
          />
          <View style={styles.center}>
            <Text style={styles.promptTitle}>請選擇縣市開始瀏覽</Text>
            <Text style={styles.centerText}>
              也可直接點放大鏡搜尋全站活動；請先確認活動類型再選縣市
            </Text>
          </View>
        </>
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
    paddingBottom: space.sm,
    gap: space.sm,
  },
  headerMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: space.sm,
    minWidth: 0,
  },
  searchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    minWidth: 0,
  },
  heading: {
    fontSize: type.heading,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
    flexShrink: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    flexShrink: 0,
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
  searchHint: {
    paddingHorizontal: space.xl,
    paddingBottom: space.sm,
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
