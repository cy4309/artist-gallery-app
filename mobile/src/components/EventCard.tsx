import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import FavoriteButton from './FavoriteButton';
import { OrgEvent } from '@/types/orgEvent';
import { colors, radius, space, type } from '@/theme/tokens';
import { eventCityName } from '@/utils/city';
import { formatEventDateRange, toISODateTime } from '@/utils/formatDate';
import { getEventImageUrl } from '@/utils/eventImage';
import { getEventCategoryLabel } from '@/utils/eventCategories';
import EventImageSourceBadge from '@/components/EventImageSourceBadge';
import { PLACEHOLDER_IMAGE_URL } from '@/utils/placeholderImage';

type EventCardProps = {
  event: OrgEvent;
  onPress?: () => void;
};

export default function EventCard({ event, onPress }: EventCardProps) {
  const imageUrl = getEventImageUrl(event.imageUrl);
  const [imageFailed, setImageFailed] = useState(false);
  const displayUrl =
    imageUrl && !imageFailed ? imageUrl : PLACEHOLDER_IMAGE_URL;
  const city = eventCityName(event);
  const categoryLabel = getEventCategoryLabel(event);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <Image
        source={{ uri: displayUrl }}
        style={styles.image}
        resizeMode="cover"
        onError={() => {
          if (imageUrl && !imageFailed) setImageFailed(true);
        }}
      />
      {categoryLabel ? (
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{categoryLabel}</Text>
        </View>
      ) : null}
      <EventImageSourceBadge imageSource={event.imageSource} />
      <View style={styles.heart}>
        <FavoriteButton
          eventId={event.id}
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

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>
          {event.actName}
        </Text>
        <Text style={styles.meta}>
          {formatEventDateRange(event.startTime, event.endTime)}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {event.address || event.cityName}
        </Text>
        {city ? <Text style={styles.city}>{city}</Text> : null}
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
  categoryBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 6,
    paddingHorizontal: space.sm,
    paddingVertical: 4,
  },
  categoryText: {
    fontSize: type.caption,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.text,
  },
  heart: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 2,
  },
  cardPressed: {
    opacity: 0.88,
    transform: [{ translateY: 1 }],
  },
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.placeholder,
  },
  body: {
    padding: space.xl,
    gap: space.sm,
  },
  title: {
    fontSize: type.body + 1,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  meta: {
    fontSize: type.caption,
    color: colors.textMuted,
  },
  city: {
    marginTop: space.xs,
    fontSize: type.caption,
    fontWeight: '600',
    letterSpacing: 1,
    color: colors.accentSoft,
  },
});
