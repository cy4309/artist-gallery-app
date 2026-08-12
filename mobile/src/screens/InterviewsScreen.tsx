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
    title: '嘉義市集幕後人物',
    summary: '之後接上真實專訪資料',
  },
  {
    id: '2',
    title: '在地創作者訪談',
    summary: '之後接上真實專訪資料',
  },
];

export default function InterviewsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>← 返回</Text>
        </Pressable>
        <Text style={styles.heading}>專訪</Text>
        <View style={styles.headerSpacer} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  back: {
    fontSize: 16,
    color: '#111',
    width: 72,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  headerSpacer: {
    width: 72,
  },
  list: {
    paddingHorizontal: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
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
