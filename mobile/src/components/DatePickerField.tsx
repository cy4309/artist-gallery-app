import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, space, type } from '@/theme/tokens';
import {
  formatFilterDateLabel,
  parseFilterDateString,
  toFilterDateString,
} from '@/utils/formatDate';

type DatePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  accessibilityLabel: string;
};

export default function DatePickerField({
  value,
  onChange,
  placeholder = '選擇日期',
  minimumDate,
  maximumDate,
  accessibilityLabel,
}: DatePickerFieldProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [draftDate, setDraftDate] = useState(() => new Date());

  const displayLabel = value ? formatFilterDateLabel(value) : placeholder;
  const hasValue = Boolean(value);

  useEffect(() => {
    if (!showPicker) return;
    setDraftDate(parseFilterDateString(value) ?? new Date());
  }, [showPicker, value]);

  const openPicker = () => setShowPicker(true);

  const closePicker = () => setShowPicker(false);

  const commitDate = (date: Date) => {
    onChange(toFilterDateString(date));
    closePicker();
  };

  const handleAndroidChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    closePicker();
    if (event.type === 'set' && selectedDate) {
      onChange(toFilterDateString(selectedDate));
    }
  };

  return (
    <>
      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        <Text
          style={[styles.triggerText, !hasValue && styles.triggerPlaceholder]}
        >
          {displayLabel}
        </Text>
        <Text style={styles.triggerChevron}>選擇 ▾</Text>
      </Pressable>

      {Platform.OS === 'android' && showPicker ? (
        <DateTimePicker
          value={parseFilterDateString(value) ?? new Date()}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={closePicker}
        >
          <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
            <View style={styles.modalHeader}>
              <Pressable onPress={closePicker} hitSlop={8}>
                <Text style={styles.modalAction}>取消</Text>
              </Pressable>
              <Text style={styles.modalTitle}>選擇日期</Text>
              <Pressable onPress={() => commitDate(draftDate)} hitSlop={8}>
                <Text style={[styles.modalAction, styles.modalActionPrimary]}>
                  完成
                </Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={draftDate}
              mode="date"
              display="spinner"
              onChange={(_, selectedDate) => {
                if (selectedDate) setDraftDate(selectedDate);
              }}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              locale="zh-TW"
              themeVariant="dark"
              style={styles.iosPicker}
            />
          </SafeAreaView>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: colors.borderMuted,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm + 2,
    backgroundColor: colors.surface,
    gap: space.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  triggerText: {
    flex: 1,
    fontSize: type.meta,
    color: colors.text,
  },
  triggerPlaceholder: {
    color: colors.textDim,
  },
  triggerChevron: {
    fontSize: type.caption,
    fontWeight: '600',
    color: colors.accentSoft,
  },
  modal: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingTop: space.sm,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  modalTitle: {
    fontSize: type.body,
    fontWeight: '700',
    color: colors.text,
  },
  modalAction: {
    fontSize: type.body,
    color: colors.textMuted,
  },
  modalActionPrimary: {
    fontWeight: '700',
    color: colors.accentSoft,
  },
  iosPicker: {
    flex: 1,
  },
});
