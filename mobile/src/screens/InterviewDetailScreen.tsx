import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const interviewTitles: Record<string, string> = {
  '1': '創作者專訪（範例）',
  '2': '文化現場人物（範例）',
};

export default function InterviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const title = id ? interviewTitles[id] : undefined;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>← 返回</Text>
        </Pressable>
        <Text style={styles.heading}>專訪詳情</Text>
        <View style={styles.headerSpacer} />
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
