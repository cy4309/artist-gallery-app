import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getOrgData } from '../api/org';
import { ApiError } from '../api/errors';
import EventCard from '../components/EventCard';
import { OrgEvent } from '../types/orgEvent';

type Status = 'loading' | 'success' | 'error';

type EventsScreenProps = {
  onBack: () => void;
};

export default function EventsScreen({ onBack }: EventsScreenProps) {
  const [status, setStatus] = useState<Status>('loading');
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} hitSlop={8}>
          <Text style={styles.back}>← 返回</Text>
        </Pressable>
        <Text style={styles.heading}>活動</Text>
        <Text style={styles.count}>
          {status === 'success' ? `${events.length} 筆` : ' '}
        </Text>
      </View>

      {status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#666" />
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

      {status === 'success' && events.length > 0 && (
        <FlatList
          data={events}
          keyExtractor={(item) => String(item.actId)}
          renderItem={({ item }) => <EventCard event={item} />}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  back: {
    fontSize: 16,
    color: '#111',
    width: 72,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  count: {
    width: 72,
    textAlign: 'right',
    fontSize: 13,
    color: '#666',
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  centerText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: '#111',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
