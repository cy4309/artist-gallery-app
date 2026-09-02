import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, space, type } from '@/theme/tokens';

type BackButtonProps = {
  onPress: () => void;
};

export default function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="返回"
    >
      <Text style={styles.text}>← 返回</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 4,
    paddingRight: space.sm,
  },
  pressed: {
    opacity: 0.85,
  },
  text: {
    fontSize: type.meta,
    fontWeight: '600',
    color: colors.textMuted,
  },
});
