import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

type InterviewItem = {
  id: string;
  title: string;
  summary: string;
};

const interviews: InterviewItem[] = [
  {
    id: '1',
    title: '創作者專訪（範例）',
    summary: '之後接上真實專訪資料',
  },
  {
    id: '2',
    title: '文化現場人物（範例）',
    summary: '之後接上真實專訪資料',
  },
];

export default function InterviewsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.heading}>專訪</Text>
      </View>

      <View style={styles.list}>
        {interviews.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.card,
              pressed && styles.cardPressed,
            ]}
            onPress={() => router.push(`/interviews/${item.id}`)}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.summary}>{item.summary}</Text>
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
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  list: {
    paddingHorizontal: 20,
    gap: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 22,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  cardPressed: {
    opacity: 0.85,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
  },
  summary: {
    marginTop: 6,
    fontSize: 14,
    color: '#666',
  },
});
