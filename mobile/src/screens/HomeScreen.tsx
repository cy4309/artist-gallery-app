import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import { env } from '../config/env';
import { colors, radius, space, type } from '../theme/tokens';

type EntryItem = {
  title: string;
  description: string;
  route: '/events' | '/interviews' | '/favorites';
};

const COVER_IMAGE = `${env.apiUrl}/images/qingshan-king-festival-1.jpg`;

const allEntries: EntryItem[] = [
  {
    title: '活動',
    description: '展覽、音樂與創作',
    route: '/events',
  },
  {
    title: '收藏',
    description: '收藏的活動',
    route: '/favorites',
  },
  {
    title: '專欄',
    description: '人物專訪',
    route: '/interviews',
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const entries = user
    ? allEntries
    : allEntries.filter((entry) => entry.route !== '/favorites');

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Image
        source={{ uri: COVER_IMAGE }}
        style={styles.coverImage}
        resizeMode="cover"
      />
      <View style={styles.coverDim} />

      <SafeAreaView style={styles.foreground} edges={['bottom']}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.copy}>
            <Text style={styles.kicker}>CYC ZINE</Text>
            <Text style={styles.title}>探索文化故事。</Text>
            <Text style={styles.lede}>我們精選城市中的展覽、音樂與創作，</Text>
            <Text style={styles.lede}>收藏屬於你的靈感地圖。</Text>
          </View>

          <View style={styles.entries}>
            {entries.map((entry) => (
              <Pressable
                key={entry.route}
                style={({ pressed }) => [
                  styles.entryCard,
                  pressed && styles.entryCardPressed,
                ]}
                onPress={() => router.push(entry.route)}
              >
                <Text style={styles.entryTitle}>{entry.title}</Text>
                <Text style={styles.entryDescription}>{entry.description}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  coverDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.42)',
  },
  foreground: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: space.xl,
  },
  copy: {
    paddingHorizontal: space.xl,
    marginBottom: space.xxl,
    gap: 4,
    alignItems: 'center',
  },
  kicker: {
    fontSize: type.caption,
    fontWeight: '700',
    letterSpacing: 4,
    color: colors.text,
    marginBottom: space.sm,
    textAlign: 'center',
  },
  title: {
    fontSize: type.display,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
    marginBottom: space.sm,
    textAlign: 'center',
  },
  lede: {
    fontSize: type.body,
    lineHeight: 22,
    color: colors.text,
    textAlign: 'center',
  },
  entries: {
    paddingHorizontal: space.xl,
    gap: space.md,
  },
  entryCard: {
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: radius.card,
    paddingVertical: space.lg,
    paddingHorizontal: space.xl,
    borderWidth: 3,
    borderColor: colors.border,
    alignItems: 'center',
  },
  entryCardPressed: {
    opacity: 0.88,
  },
  entryTitle: {
    fontSize: type.heading,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
    textAlign: 'center',
  },
  entryDescription: {
    marginTop: space.xs,
    fontSize: type.meta,
    lineHeight: 20,
    color: colors.text,
    textAlign: 'center',
  },
});
