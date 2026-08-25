import { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getInterviewBySlug, INTERVIEW_TAG_LABELS } from '@/data/interviews';
import { colors, radius, space, type } from '@/theme/tokens';
import { getInterviewImageUrl } from '@/utils/interviewImage';
import { PLACEHOLDER_IMAGE_URL } from '@/utils/placeholderImage';

export default function InterviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const person = id ? getInterviewBySlug(id) : undefined;
  const imageUrl = person ? getInterviewImageUrl(person.coverImage) : null;
  const [imageFailed, setImageFailed] = useState(false);
  const displayUrl =
    imageUrl && !imageFailed ? imageUrl : PLACEHOLDER_IMAGE_URL;

  async function openWebsite() {
    if (!person?.websiteSrc) return;
    Alert.alert('繼續探索嗎？', '你即將前往外部網站瀏覽相關內容。', [
      { text: '留在此頁', style: 'cancel' },
      {
        text: '繼續前往',
        onPress: () => {
          void Linking.openURL(person.websiteSrc);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.heading}>專訪詳情</Text>
      </View>

      {!person ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>找不到這篇專訪</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.mediaFrame}>
            <Image
              source={{ uri: displayUrl }}
              style={styles.image}
              resizeMode="cover"
              onError={() => {
                if (imageUrl && !imageFailed) setImageFailed(true);
              }}
            />
          </View>

          <Text style={styles.name}>{person.name}</Text>
          <Text style={styles.role}>{person.role}</Text>
          <Text style={styles.firm}>{person.firm}</Text>

          <View style={styles.tags}>
            {person.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{INTERVIEW_TAG_LABELS[tag]}</Text>
              </View>
            ))}
          </View>

          {person.websiteSrc ? (
            <Pressable
              style={({ pressed }) => [
                styles.linkButton,
                pressed && styles.linkPressed,
              ]}
              onPress={openWebsite}
            >
              <Text style={styles.linkText}>查看網站 →</Text>
            </Pressable>
          ) : null}
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
    gap: space.sm,
  },
  mediaFrame: {
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: space.md,
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: colors.bg,
  },
  name: {
    fontSize: type.title,
    fontWeight: '700',
    color: colors.text,
  },
  role: {
    fontSize: type.body,
    color: colors.textMuted,
  },
  firm: {
    fontSize: type.meta,
    color: colors.textDim,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    marginTop: space.md,
  },
  tag: {
    borderWidth: 1,
    borderColor: colors.borderMuted,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
  },
  tagText: {
    fontSize: type.caption,
    color: colors.accentSoft,
  },
  linkButton: {
    marginTop: space.lg,
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
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontSize: type.heading,
    fontWeight: '600',
    color: colors.text,
  },
});
