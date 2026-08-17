import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, space, type } from '@/theme/tokens';

export const ALL_CITIES = '全部';

type CityPickerProps = {
  cities: string[];
  selected: string;
  onSelect: (city: string) => void;
};

export default function CityPicker({
  cities,
  selected,
  onSelect,
}: CityPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const options = useMemo(() => {
    const q = query.trim();
    const list = [ALL_CITIES, ...cities];
    if (!q) return list;
    return list.filter((city) => city.includes(q));
  }, [cities, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
  };

  const pick = (city: string) => {
    onSelect(city);
    close();
  };

  return (
    <>
      <View style={styles.triggerWrap}>
        <Pressable
          style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
          onPress={() => setOpen(true)}
          accessibilityRole="button"
          accessibilityLabel={`選擇縣市，目前 ${selected}`}
        >
          <View>
            <Text style={styles.triggerLabel}>縣市</Text>
            <Text style={styles.triggerValue}>{selected}</Text>
          </View>
          <Text style={styles.triggerChevron}>選擇 ▾</Text>
        </Pressable>
      </View>

      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={close}
      >
        <SafeAreaView style={styles.modal} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>選擇縣市</Text>
            <Pressable onPress={close} hitSlop={8}>
              <Text style={styles.modalClose}>關閉</Text>
            </Pressable>
          </View>

          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="搜尋縣市…"
            placeholderTextColor={colors.textDim}
            style={styles.search}
            autoCorrect={false}
            clearButtonMode="while-editing"
          />

          <FlatList
            data={options}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <Text style={styles.empty}>找不到符合的縣市</Text>
            }
            renderItem={({ item }) => {
              const active = item === selected;
              return (
                <Pressable
                  onPress={() => pick(item)}
                  style={({ pressed }) => [
                    styles.option,
                    active && styles.optionActive,
                    pressed && styles.pressed,
                  ]}
                >
                  <Text
                    style={[styles.optionText, active && styles.optionTextActive]}
                  >
                    {item}
                  </Text>
                  {active ? <Text style={styles.check}>✓</Text> : null}
                </Pressable>
              );
            }}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerWrap: {
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  triggerLabel: {
    fontSize: type.caption,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  triggerValue: {
    marginTop: 2,
    fontSize: type.heading,
    fontWeight: '700',
    color: colors.text,
  },
  triggerChevron: {
    fontSize: type.meta,
    fontWeight: '600',
    color: colors.accentSoft,
  },
  pressed: {
    opacity: 0.85,
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
  },
  modalTitle: {
    fontSize: type.heading,
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
  },
  modalClose: {
    fontSize: type.body,
    color: colors.textMuted,
  },
  search: {
    marginHorizontal: space.xl,
    marginBottom: space.md,
    borderWidth: 2,
    borderColor: colors.borderMuted,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    fontSize: type.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  list: {
    paddingHorizontal: space.xl,
    paddingBottom: space.xxxl,
    gap: space.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: colors.borderMuted,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md + 2,
    backgroundColor: colors.surface,
  },
  optionActive: {
    borderColor: colors.border,
    backgroundColor: colors.text,
  },
  optionText: {
    fontSize: type.body,
    fontWeight: '600',
    color: colors.text,
  },
  optionTextActive: {
    color: colors.bg,
  },
  check: {
    fontSize: type.body,
    fontWeight: '700',
    color: colors.bg,
  },
  empty: {
    marginTop: space.xxl,
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: type.meta,
  },
});
