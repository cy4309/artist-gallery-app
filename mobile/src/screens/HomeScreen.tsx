import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type EntryItem = {
  title: string;
  description: string;
  route: '/events' | '/interviews' | '/favorites';
};

const entries: EntryItem[] = [
  {
    title: 'Events',
    description: '嘉義文化活動',
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
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.logo}>CYC ZINE</Text>
        <Text style={styles.subtitle}>嘉義文化活動指南</Text>
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

      <Pressable
        style={({ pressed }) => [styles.settingsLink, pressed && styles.settingsPressed]}
        onPress={() => router.push('/settings')}
      >
        <Text style={styles.settingsText}>設定 · Push Notification</Text>
      </Pressable>
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
    gap: 12,
  },
  entryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
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
    marginTop: 4,
    fontSize: 14,
    color: '#666',
  },
  settingsLink: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingsPressed: {
    opacity: 0.7,
  },
  settingsText: {
    fontSize: 14,
    color: '#666',
  },
});
