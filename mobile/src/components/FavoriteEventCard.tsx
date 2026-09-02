import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { FavoriteRecord } from '@/api/favorites';
import FavoriteButton from '@/components/FavoriteButton';
import { colors, radius, space, type } from '@/theme/tokens';
import { formatEventDateRange } from '@/utils/formatDate';
import { getEventImageUrl } from '@/utils/eventImage';
import { PLACEHOLDER_IMAGE_URL } from '@/utils/placeholderImage';

type FavoriteEventCardProps = {
  item: FavoriteRecord;
  ended: boolean;
  onPress: () => void;
};

function resolveFavoriteImageUrl(imageUrl?: string): string {
  if (!imageUrl) return PLACEHOLDER_IMAGE_URL;
  if (imageUrl.includes('/api/image-proxy')) return imageUrl;
  return getEventImageUrl(imageUrl) ?? PLACEHOLDER_IMAGE_URL;
}

export default function FavoriteEventCard({
  item,
  ended,
  onPress,
}: FavoriteEventCardProps) {
  const resolvedUrl = resolveFavoriteImageUrl(item.imageUrl);
  const [imageFailed, setImageFailed] = useState(false);
  const displayUrl =
    resolvedUrl && !imageFailed ? resolvedUrl : PLACEHOLDER_IMAGE_URL;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        ended && styles.cardEnded,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.mediaFrame}>
        <Image
          source={{ uri: displayUrl }}
          style={[styles.image, ended && styles.imageEnded]}
          resizeMode="cover"
          onError={() => {
            if (resolvedUrl && !imageFailed) setImageFailed(true);
          }}
        />
        {ended ? (
          <View style={styles.endedBadge}>
            <Text style={styles.endedBadgeText}>已結束</Text>
          </View>
        ) : null}
        <View style={styles.heart}>
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
      </View>

      <View style={styles.body}>
        <Text
          style={[styles.title, ended && styles.textEnded]}
          numberOfLines={2}
        >
          {item.eventTitle}
        </Text>
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
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.border,
  },
  cardEnded: {
    borderColor: colors.borderMuted,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ translateY: 1 }],
  },
  mediaFrame: {
    position: 'relative',
    backgroundColor: colors.placeholder,
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.placeholder,
  },
  imageEnded: {
    opacity: 0.55,
  },
  endedBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 6,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
  },
  endedBadgeText: {
    fontSize: type.caption,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  body: {
    padding: space.lg,
    gap: space.sm,
  },
  title: {
    fontSize: type.body,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  textEnded: {
    color: colors.textDim,
  },
  meta: {
    fontSize: type.caption,
    color: colors.textMuted,
  },
});
