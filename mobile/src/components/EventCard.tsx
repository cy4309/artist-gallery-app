import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { OrgEvent } from '../types/orgEvent';
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
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cardPressed: {
    opacity: 0.85,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: '#eee',
  },
  placeholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 13,
    color: '#999',
  },
  body: {
    padding: 16,
    gap: 6,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  meta: {
    fontSize: 13,
    color: '#666',
  },
});
