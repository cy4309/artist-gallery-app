import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const interviewTitles: Record<string, string> = {
  '1': '創作者專訪（範例）',
  '2': '文化現場人物（範例）',
};

export default function InterviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const title = id ? interviewTitles[id] : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.heading}>專訪詳情</Text>
      </View>

      <View style={styles.content}>
        {title ? (
          <>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.body}>
              這是專訪詳情頁的 placeholder。之後會接上真實內容與 API。
            </Text>
          </>
        ) : (
          <Text style={styles.body}>找不到這篇專訪。</Text>
        )}
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
  content: {
    paddingHorizontal: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
  },
});
