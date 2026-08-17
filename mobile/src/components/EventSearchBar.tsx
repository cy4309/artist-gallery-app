import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, space, type } from '@/theme/tokens';

type EventSearchTriggerProps = {
  expanded: boolean;
  onToggle: () => void;
};

export function EventSearchTrigger({
  expanded,
  onToggle,
}: EventSearchTriggerProps) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      style={({ pressed }) => [styles.trigger, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={expanded ? '關閉搜尋' : '搜尋活動關鍵字'}
    >
      <Text style={styles.triggerIcon}>{expanded ? '✕' : '⌕'}</Text>
    </Pressable>
  );
}

type EventSearchPanelProps = {
  expanded: boolean;
  value: string;
  onChange: (value: string) => void;
};

export function EventSearchPanel({
  expanded,
  value,
  onChange,
}: EventSearchPanelProps) {
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!expanded) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 200);
    return () => clearTimeout(timer);
  }, [expanded]);

  if (!expanded) return null;

  return (
    <View style={styles.panel}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChange}
        placeholder="搜尋活動關鍵字…"
        placeholderTextColor={colors.textDim}
        style={styles.input}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  triggerIcon: {
    fontSize: 24,
    lineHeight: 28,
    color: colors.text,
  },
  panel: {
    paddingHorizontal: space.xl,
    paddingBottom: space.md,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.borderMuted,
    borderRadius: radius.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
    fontSize: type.body,
    color: colors.text,
    backgroundColor: colors.surface,
  },
});
