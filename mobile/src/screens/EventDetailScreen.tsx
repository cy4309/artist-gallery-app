import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getOrgData } from '@/api/org';
import { ApiError } from '@/api/errors';
import { colors, radius, space, type } from '@/theme/tokens';
import { OrgEvent } from '@/types/orgEvent';
import { formatEventDateRange, toISODateTime } from '@/utils/formatDate';
import { getEventImageUrl } from '@/utils/eventImage';
import { eventCityName } from '@/utils/city';
import FavoriteButton from '@/components/FavoriteButton';
import { getEventShareUrl } from '@/utils/share';

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
  const city = event ? eventCityName(event) : null;

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
          <Text style={styles.errorTitle}>載入失敗</Text>
          <Text style={styles.centerText}>{errorMessage}</Text>
          <Pressable style={styles.retryButton} onPress={load}>
            <Text style={styles.retryText}>再試一次</Text>
          </Pressable>
        </View>
      )}

      {status === 'success' && event && (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.mediaFrame}>
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
            <View style={styles.heart}>
              <FavoriteButton
                eventId={String(event.actId)}
                extra={{
                  eventTitle: event.actName,
                  eventStartDate: toISODateTime(event.startTime),
                  eventEndDate: toISODateTime(event.endTime),
                  eventLocation: event.address,
                  eventUrl: event.website,
                  imageUrl: imageUrl ?? undefined,
                }}
              />
            </View>
          </View>

          {city ? <Text style={styles.cityLabel}>{city}</Text> : null}

          <Text style={styles.title}>{event.actName}</Text>
          <Text style={styles.meta}>
            {formatEventDateRange(event.startTime, event.endTime)}
          </Text>
          <Text style={styles.meta}>{event.address || event.cityName}</Text>

          {event.description ? (
            <Text style={styles.description}>{event.description}</Text>
          ) : null}

          {event.website ? (
            <Pressable
              style={({ pressed }) => [
                styles.linkButton,
                pressed && styles.linkPressed,
              ]}
              onPress={() => Linking.openURL(event.website)}
            >
              <Text style={styles.linkText}>造訪官網 →</Text>
            </Pressable>
          ) : null}

          <Pressable
            style={({ pressed }) => [
              styles.linkButton,
              pressed && styles.linkPressed,
            ]}
            onPress={() => {
              const url = getEventShareUrl(event.actId);
              void Share.share({
                title: event.actName,
                message:
                  Platform.OS === 'android'
                    ? `${event.actName}\n${url}`
                    : event.actName,
                url,
              });
            }}
          >
            <Text style={styles.linkText}>分享活動</Text>
          </Pressable>
        </ScrollView>
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
  content: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxxl,
    gap: space.md,
  },
  mediaFrame: {
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.placeholder,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.placeholder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: type.meta,
    color: colors.textDim,
  },
  cityLabel: {
    marginTop: space.sm,
    fontSize: type.caption,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.accentSoft,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 30,
  },
  meta: {
    fontSize: type.meta,
    color: colors.textMuted,
  },
  description: {
    marginTop: space.sm,
    fontSize: type.body,
    lineHeight: 24,
    color: colors.text,
  },
  linkButton: {
    marginTop: space.md,
    alignSelf: 'flex-start',
    paddingVertical: space.sm,
  },
  linkPressed: {
    opacity: 0.7,
  },
  linkText: {
    fontSize: type.meta,
    fontWeight: '600',
    color: colors.accentSoft,
    letterSpacing: 0.5,
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
