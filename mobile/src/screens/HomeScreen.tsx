import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';

type EntryItem = {
  title: string;
  description: string;
  route: '/events' | '/interviews' | '/favorites';
};

const allEntries: EntryItem[] = [
  {
    title: 'Events',
    description: '展覽、音樂與創作',
    route: '/events',
  },
  {
    title: 'Interviews',
    description: '人物專訪',
    route: '/interviews',
  },
  {
    title: 'Favorites',
    description: '收藏的活動',
    route: '/favorites',
  },
];

export default function HomeScreen() {
  const { user } = useAuth();
  const entries = user
    ? allEntries
    : allEntries.filter((entry) => entry.route !== '/favorites');

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.logo}>CYC ZINE</Text>
        <Text style={styles.subtitle}>探索文化故事</Text>
      </View>

      <View style={styles.entries}>
        {entries.map((entry) => (
          <Pressable
            key={entry.title}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 40,
  },
  logo: {
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: 2,
    color: '#111',
  },
  subtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#666',
  },
  entries: {
    gap: 20,
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  entryCardPressed: {
    opacity: 0.85,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  entryDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});
