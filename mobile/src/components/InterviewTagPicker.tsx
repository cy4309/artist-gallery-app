import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  INTERVIEW_TAG_GROUPS,
  INTERVIEW_TAG_LABELS,
  InterviewFilterTag,
} from '@/data/interviews';
import { colors, radius, space, type } from '@/theme/tokens';

type InterviewTagPickerProps = {
  selected: InterviewFilterTag;
  onSelect: (tag: InterviewFilterTag) => void;
};

export default function InterviewTagPicker({
  selected,
  onSelect,
}: InterviewTagPickerProps) {
  const [open, setOpen] = useState(false);

  function pick(tag: InterviewFilterTag) {
    onSelect(tag);
    setOpen(false);
  }

  return (
    <>
      <View style={styles.triggerWrap}>
        <Pressable
          style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
          onPress={() => setOpen(true)}
        >
          <View>
            <Text style={styles.triggerLabel}>篩選器</Text>
            <Text style={styles.triggerValue}>{INTERVIEW_TAG_LABELS[selected]}</Text>
          </View>
          <Text style={styles.triggerChevron}>選擇 ▾</Text>
        </Pressable>
      </View>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>篩選專欄</Text>
            <Pressable onPress={() => setOpen(false)} hitSlop={8}>
              <Text style={styles.modalClose}>關閉</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <Pressable
              style={[styles.chip, selected === 'all' && styles.chipOn]}
              onPress={() => pick('all')}
            >
              <Text style={[styles.chipText, selected === 'all' && styles.chipTextOn]}>
                全部
              </Text>
            </Pressable>

            {INTERVIEW_TAG_GROUPS.map((group) => (
              <View key={group.label} style={styles.group}>
                <Text style={styles.groupLabel}>{group.label}</Text>
                <View style={styles.chips}>
                  {group.tags.map((tag) => {
                    const on = selected === tag;
                    return (
                      <Pressable
                        key={tag}
                        style={[styles.chip, on && styles.chipOn]}
                        onPress={() => pick(tag)}
                      >
                        <Text style={[styles.chipText, on && styles.chipTextOn]}>
                          {INTERVIEW_TAG_LABELS[tag]}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerWrap: {
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  pressed: {
    opacity: 0.85,
  },
  triggerLabel: {
    fontSize: type.caption,
    letterSpacing: 2,
    color: colors.textDim,
  },
  triggerValue: {
    marginTop: 2,
    fontSize: type.body,
    fontWeight: '700',
    color: colors.text,
  },
  triggerChevron: {
    fontSize: type.meta,
    color: colors.textMuted,
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
    paddingVertical: space.lg,
  },
  modalTitle: {
    fontSize: type.heading,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
  },
  modalClose: {
    fontSize: type.body,
    color: colors.text,
  },
  modalBody: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxxl,
    gap: space.xl,
  },
  group: {
    gap: space.md,
  },
  groupLabel: {
    fontSize: type.caption,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.textDim,
    textAlign: 'center',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: space.sm,
  },
  chip: {
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  chipOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    fontSize: type.meta,
    color: colors.text,
  },
  chipTextOn: {
    fontWeight: '700',
    color: colors.text,
  },
});
