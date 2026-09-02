import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import DatePickerField from '@/components/DatePickerField';
import { colors, radius, space, type } from '@/theme/tokens';
import { parseFilterDateString } from '@/utils/formatDate';

type EventDateRangeFilterProps = {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  onClear?: () => void;
};

export default function EventDateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
  onConfirm,
  confirmDisabled = false,
  onClear,
}: EventDateRangeFilterProps) {
  const minToDate = useMemo(
    () => parseFilterDateString(from) ?? undefined,
    [from]
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.field}>
          <Text style={styles.label}>開始日期</Text>
          <DatePickerField
            value={from}
            onChange={onFromChange}
            placeholder="選擇開始日期"
            accessibilityLabel="選擇開始日期"
            maximumDate={parseFilterDateString(to) ?? undefined}
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>結束日期</Text>
          <DatePickerField
            value={to}
            onChange={onToChange}
            placeholder="選擇結束日期"
            accessibilityLabel="選擇結束日期"
            minimumDate={minToDate}
          />
        </View>
      </View>
      <View style={styles.actions}>
        {onConfirm ? (
          <Pressable
            style={({ pressed }) => [
              styles.confirmBtn,
              confirmDisabled && styles.btnDisabled,
              pressed && !confirmDisabled && styles.pressed,
            ]}
            disabled={confirmDisabled}
            onPress={onConfirm}
          >
            <Text style={styles.confirmText}>確認日期</Text>
          </Pressable>
        ) : null}
        {(from || to) && onClear ? (
          <Pressable
            style={({ pressed }) => [styles.clearBtn, pressed && styles.pressed]}
            onPress={onClear}
          >
            <Text style={styles.clearText}>清除</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.md,
  },
  row: {
    flexDirection: 'row',
    gap: space.md,
  },
  field: {
    flex: 1,
    gap: space.xs,
  },
  label: {
    fontSize: type.caption,
    color: colors.textMuted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
  },
  confirmBtn: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.text,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  confirmText: {
    fontSize: type.caption,
    fontWeight: '700',
    color: colors.bg,
  },
  clearBtn: {
    borderWidth: 2,
    borderColor: colors.borderMuted,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  clearText: {
    fontSize: type.caption,
    fontWeight: '600',
    color: colors.textMuted,
  },
  btnDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
});
