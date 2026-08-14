import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { InterviewPerson } from '../types/interview';
import { colors, radius, space, type } from '../theme/tokens';
import { getInterviewImageUrl } from '../utils/interviewImage';

type InterviewCardProps = {
  person: InterviewPerson;
  onPress?: () => void;
};

export default function InterviewCard({ person, onPress }: InterviewCardProps) {
  const imageUrl = getInterviewImageUrl(person.coverImage);
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
        <Text style={styles.name}>{person.name}</Text>
        <Text style={styles.role}>{person.role}</Text>
        <Text style={styles.more}>查看人物故事</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.border,
  },
  cardPressed: {
    opacity: 0.88,
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.bg,
  },
  placeholder: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: type.meta,
    color: colors.textDim,
  },
  body: {
    padding: space.md,
    alignItems: 'center',
    gap: 2,
  },
  name: {
    fontSize: type.body,
    fontWeight: '700',
    color: colors.text,
  },
  role: {
    fontSize: type.meta,
    color: colors.textMuted,
  },
  more: {
    marginTop: space.xs,
    fontSize: type.caption,
    color: colors.textDim,
  },
});
