import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, space, type } from '@/theme/tokens';
import {
  ALL_EVENT_CATEGORY_IDS,
  EVENT_CATEGORY_OPTIONS,
  EventCategoryId,
} from '@/utils/eventCategories';

type EventCategoryPickerProps = {
  selected: EventCategoryId[];
  onChange: (next: EventCategoryId[]) => void;
  onConfirm: (selected: EventCategoryId[]) => void;
  onCancel?: () => void;
  loading?: boolean;
  /** false = 只存類型，尚未載入列表（先類別再城市） */
  confirmLoadsData?: boolean;
  allowCancel?: boolean;
};

export default function EventCategoryPicker({
  selected,
  onChange,
  onConfirm,
  onCancel,
  loading = false,
  confirmLoadsData = false,
  allowCancel = true,
}: EventCategoryPickerProps) {
  const selectedSet = new Set(selected);
  const allSelected = selected.length === ALL_EVENT_CATEGORY_IDS.length;

  const toggle = (id: EventCategoryId) => {
    if (selectedSet.has(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.title}>選擇活動類型</Text>
            <Text style={styles.hint}>
              請勾選想看的類型（預設不選），確認後再選縣市
            </Text>
          </View>
          {allowCancel && onCancel ? (
            <Pressable
              onPress={onCancel}
              hitSlop={8}
              disabled={loading}
              style={({ pressed }) => [styles.close, pressed && styles.pressed]}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.chipBtn, pressed && styles.pressed]}
            onPress={() => onChange([...ALL_EVENT_CATEGORY_IDS])}
          >
            <Text style={styles.chipBtnText}>全選</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.chipBtn, pressed && styles.pressed]}
            onPress={() => onChange([])}
          >
            <Text style={styles.chipBtnText}>清空</Text>
          </Pressable>
          <Text style={styles.count}>
            已選 {selected.length}/{ALL_EVENT_CATEGORY_IDS.length}
            {allSelected ? '（全部）' : ''}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        >
          {EVENT_CATEGORY_OPTIONS.map((option) => {
            const active = selectedSet.has(option.id);
            return (
              <Pressable
                key={option.id}
                onPress={() => toggle(option.id)}
                style={({ pressed }) => [
                  styles.option,
                  active && styles.optionActive,
                  pressed && styles.pressed,
                ]}
              >
                <Text
                  style={[styles.optionText, active && styles.optionTextActive]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Pressable
          style={({ pressed }) => [
            styles.confirm,
            (loading || selected.length === 0) && styles.confirmDisabled,
            pressed && selected.length > 0 && !loading && styles.pressed,
          ]}
          disabled={loading || selected.length === 0}
          onPress={() => onConfirm(selected)}
        >
          <Text style={styles.confirmText}>
            {loading
              ? '載入中…'
              : confirmLoadsData
                ? '確認載入'
                : '確認類型'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.xxxl,
  },
  card: {
    flex: 1,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    padding: space.lg,
    gap: space.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: space.md,
  },
  headerText: {
    flex: 1,
    gap: space.xs,
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
    color: colors.text,
  },
  hint: {
    marginTop: space.xs,
    fontSize: type.meta,
    color: colors.textMuted,
    lineHeight: 20,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: type.body,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: space.sm,
  },
  chipBtn: {
    borderWidth: 2,
    borderColor: colors.borderMuted,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
  },
  chipBtnText: {
    fontSize: type.caption,
    fontWeight: '600',
    color: colors.text,
  },
  count: {
    fontSize: type.caption,
    color: colors.textDim,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    paddingBottom: space.md,
  },
  option: {
    width: '48%',
    borderWidth: 2,
    borderColor: colors.borderMuted,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    backgroundColor: colors.bg,
    opacity: 0.85,
  },
  optionActive: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    opacity: 1,
  },
  optionText: {
    fontSize: type.meta,
    fontWeight: '600',
    color: colors.textMuted,
  },
  optionTextActive: {
    color: colors.text,
  },
  confirm: {
    marginTop: 'auto',
    backgroundColor: colors.text,
    borderRadius: radius.md,
    paddingVertical: space.md + 2,
    alignItems: 'center',
  },
  confirmDisabled: {
    opacity: 0.45,
  },
  confirmText: {
    fontSize: type.body,
    fontWeight: '700',
    color: colors.bg,
  },
  pressed: {
    opacity: 0.85,
  },
});
