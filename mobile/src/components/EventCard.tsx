import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { OrgEvent } from '../types/orgEvent';
import { colors, radius, space, type } from '../theme/tokens';
import { eventCityName } from '../utils/city';
import { formatEventDateRange } from '../utils/formatDate';
import { getEventImageUrl } from '../utils/eventImage';

type EventCardProps = {
  event: OrgEvent;
  onPress?: () => void;
};

export default function EventCard({ event, onPress }: EventCardProps) {
  const imageUrl = getEventImageUrl(event.imageUrl);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(imageUrl) && !imageFailed;
  const city = eventCityName(event);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
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
  cardPressed: {
    opacity: 0.88,
    transform: [{ translateY: 1 }],
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
  body: {
    padding: space.lg,
    gap: space.xs + 2,
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
