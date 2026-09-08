import { useState } from 'react';
import {
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

import FavoriteButton from '@/components/FavoriteButton';
import EventImageSourceBadge from '@/components/EventImageSourceBadge';
import { COPY } from '@/content/copy';
import { colors, radius, space, type } from '@/theme/tokens';
import { OrgEvent } from '@/types/orgEvent';
import { eventCityName } from '@/utils/city';
import { getEventCategoryLabel } from '@/utils/eventCategories';
import { formatEventDateRange, toISODateTime } from '@/utils/formatDate';
import { getEventImageUrl } from '@/utils/eventImage';
import { PLACEHOLDER_IMAGE_URL } from '@/utils/placeholderImage';
import { getEventShareUrl } from '@/utils/share';

type EventDetailSlideProps = {
  event: OrgEvent;
  width: number;
};

export default function EventDetailSlide({
  event,
  width,
}: EventDetailSlideProps) {
  const imageUrl = getEventImageUrl(event.imageUrl);
  const [imageFailed, setImageFailed] = useState(false);
  const displayUrl =
    imageUrl && !imageFailed ? imageUrl : PLACEHOLDER_IMAGE_URL;
  const city = eventCityName(event);
  const categoryLabel = getEventCategoryLabel(event);

  return (
    <View style={{ width }}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mediaFrame}>
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
            <Text style={styles.linkText}>{COPY.events.visitWebsite}</Text>
          </Pressable>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.linkButton,
            pressed && styles.linkPressed,
          ]}
          onPress={() => {
            const url = getEventShareUrl(event.id);
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
          <Text style={styles.linkText}>{COPY.events.shareEvent}</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxxl,
    gap: space.md,
  },
  mediaFrame: {
    position: 'relative',
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
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
  image: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: colors.placeholder,
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
});
