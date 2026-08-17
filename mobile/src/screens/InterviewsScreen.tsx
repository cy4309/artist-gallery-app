import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import InterviewCard from '@/components/InterviewCard';
import InterviewTagPicker from '@/components/InterviewTagPicker';
import {
  filterInterviews,
  InterviewFilterTag,
} from '@/data/interviews';
import { colors, space, type } from '@/theme/tokens';

export default function InterviewsScreen() {
  const [tag, setTag] = useState<InterviewFilterTag>('all');
  const people = useMemo(() => filterInterviews(tag), [tag]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.heading}>專欄精選</Text>
          <Text style={styles.lede}>
            這裡收錄我們精選的台灣文化人物與故事。
          </Text>
        </View>
        <Text style={styles.count}>{people.length} 筆</Text>
      </View>

      <InterviewTagPicker selected={tag} onSelect={setTag} />

      <FlatList
        data={people}
        keyExtractor={(item) => item.slug}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <InterviewCard
            person={item}
            onPress={() => router.push(`/interviews/${item.slug}`)}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>這個篩選目前沒有專訪</Text>
        }
        ListFooterComponent={
          people.length > 0 ? (
            <Text style={styles.footer}>持續新增中...</Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.lg,
    gap: space.md,
  },
  headerText: {
    flex: 1,
    gap: space.sm,
  },
  heading: {
    fontSize: type.heading,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
  },
  lede: {
    fontSize: type.meta,
    lineHeight: 20,
    color: colors.textMuted,
  },
  count: {
    fontSize: type.meta,
    color: colors.textMuted,
    paddingTop: 4,
  },
  list: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxxl,
    gap: space.lg,
  },
  row: {
    gap: space.lg,
  },
  empty: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: type.meta,
    paddingTop: space.xxxl,
  },
  footer: {
    textAlign: 'center',
    color: colors.textDim,
    fontSize: type.caption,
    letterSpacing: 1,
    paddingTop: space.lg,
  },
});
