import { Pressable, StyleSheet, Text, View } from 'react-native';

import ApiStatus from '../components/ApiStatus';

type EntryItem = {
  title: string;
  description: string;
};

const entries: EntryItem[] = [
  {
    title: 'Events',
    description: '嘉義文化活動',
  },
  {
    title: 'Interviews',
    description: '人物專訪',
  },
  {
    title: 'Favorites',
    description: '收藏的活動',
  },
];

export default function HomeScreen() {
  return (
    <View style={styles.container}>
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
            onPress={() => {
              // 第四階段會加入 Navigation
            }}
          >
            <Text style={styles.entryTitle}>{entry.title}</Text>
            <Text style={styles.entryDescription}>{entry.description}</Text>
          </Pressable>
        ))}
      </View>

      <ApiStatus />

      <Text style={styles.hint}>第二階段：API layer 已建立</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
    paddingHorizontal: 24,
    paddingTop: 72,
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
  hint: {
    marginTop: 'auto',
    textAlign: 'center',
    fontSize: 13,
    color: '#999',
  },
});
