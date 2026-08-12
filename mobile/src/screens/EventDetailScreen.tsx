import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getOrgData } from '../api/org';
import { ApiError } from '../api/errors';
import { OrgEvent } from '../types/orgEvent';
import { formatEventDateRange } from '../utils/formatDate';
import { getEventImageUrl } from '../utils/eventImage';

type Status = 'loading' | 'success' | 'error';

export default function EventDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [status, setStatus] = useState<Status>('loading');
  const [event, setEvent] = useState<OrgEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [imageFailed, setImageFailed] = useState(false);

  const load = useCallback(async () => {
    if (!id) {
      setErrorMessage('找不到活動 ID');
      setStatus('error');
      return;
    }

    try {
      setStatus('loading');
      const events = await getOrgData();
      const found = events.find((item) => String(item.actId) === id);

      if (!found) {
        setErrorMessage('找不到這個活動');
        setStatus('error');
        return;
      }

      setEvent(found);
      setImageFailed(false);
      setStatus('success');
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Unknown error');
      }
      setStatus('error');
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const imageUrl = event ? getEventImageUrl(event.imageUrl) : null;
  const showImage = Boolean(imageUrl) && !imageFailed;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>← 返回</Text>
        </Pressable>
        <Text style={styles.heading}>活動詳情</Text>
        <View style={styles.headerSpacer} />
      </View>

      {status === 'loading' && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#666" />
          <Text style={styles.centerText}>載入中…</Text>
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

      {status === 'success' && event && (
        <ScrollView contentContainerStyle={styles.content}>
          {showImage ? (
            <Image
              source={{ uri: imageUrl as string }}
              style={styles.image}
              resizeMode="cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>無圖片</Text>
            </View>
          )}

          <Text style={styles.title}>{event.actName}</Text>
          <Text style={styles.meta}>
            {formatEventDateRange(event.startTime, event.endTime)}
          </Text>
          <Text style={styles.meta}>{event.address || event.cityName}</Text>

          {event.description ? (
            <Text style={styles.description}>{event.description}</Text>
          ) : null}

          {event.website ? (
            <Text style={styles.website}>官網：{event.website}</Text>
          ) : null}
        </ScrollView>
      )}
    </SafeAreaView>
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
    paddingTop: 8,
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
  headerSpacer: {
    width: 72,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 12,
  },
  image: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  placeholder: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 13,
    color: '#999',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  meta: {
    fontSize: 14,
    color: '#666',
  },
  description: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  website: {
    fontSize: 13,
    color: '#666',
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
