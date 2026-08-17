import { useCallback, useEffect, useMemo, useState } from 'react';
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

import { getOrgData } from '@/api/org';
import { ApiError } from '@/api/errors';
import CityPicker, { ALL_CITIES } from '@/components/CityPicker';
import EventCard from '@/components/EventCard';
import {
  EventSearchPanel,
  EventSearchTrigger,
} from '@/components/EventSearchBar';
import { colors, space, type } from '@/theme/tokens';
import { OrgEvent } from '@/types/orgEvent';
import { eventCityName, uniqueCityNames } from '@/utils/city';
import { filterEventsByKeyword } from '@/utils/eventSearch';

type Status = 'loading' | 'success' | 'error';

export default function EventsScreen() {
  const [status, setStatus] = useState<Status>('loading');
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCity, setSelectedCity] = useState(ALL_CITIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setStatus('loading');
      const data = await getOrgData();
      setEvents(data);
      setStatus('success');
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unknown error');
      }
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const cities = useMemo(() => uniqueCityNames(events), [events]);

  const filtered = useMemo(() => {
    const byCity =
      selectedCity === ALL_CITIES
        ? events
        : events.filter((event) => eventCityName(event) === selectedCity);
    return filterEventsByKeyword(byCity, searchQuery);
  }, [events, selectedCity, searchQuery]);

  const hasSearch = searchQuery.trim().length > 0;

  function toggleSearch() {
    setSearchOpen((open) => {
      if (open) setSearchQuery('');
      return !open;
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.heading}>活動</Text>
        <View style={styles.headerRight}>
          <Text style={styles.count}>
            {status === 'success' ? `${filtered.length} 筆` : ' '}
          </Text>
          {status === 'success' && events.length > 0 ? (
            <EventSearchTrigger expanded={searchOpen} onToggle={toggleSearch} />
          ) : null}
        </View>
      </View>

      {status === 'success' && events.length > 0 && (
        <>
          <EventSearchPanel
            expanded={searchOpen}
            value={searchQuery}
            onChange={setSearchQuery}
          />
          <CityPicker
            cities={cities}
            selected={selectedCity}
            onSelect={setSelectedCity}
          />
        </>
      )}

      {status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.border} />
          <Text style={styles.centerText}>載入活動中…</Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>載入失敗</Text>
          <Text style={styles.centerText}>{errorMessage}</Text>
          <Pressable style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>再試一次</Text>
          </Pressable>
        </View>
      )}

      {status === 'success' && events.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>目前沒有活動</Text>
          <Text style={styles.centerText}>稍後再回來看看</Text>
        </View>
      )}

      {status === 'success' && events.length > 0 && filtered.length === 0 && (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>
            {hasSearch ? '找不到符合的活動' : '這個縣市暫無活動'}
          </Text>
          <Text style={styles.centerText}>
            {hasSearch ? '試試其他關鍵字或縣市' : '試試選「全部」或其他縣市'}
          </Text>
        </View>
      )}

      {status === 'success' && filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.actId)}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              onPress={() => router.push(`/events/${item.actId}`)}
            />
          )}
          contentContainerStyle={styles.list}
        />
      )}
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
