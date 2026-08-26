import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, space, type } from '@/theme/tokens';

type ScrollToTopButtonProps = {
  visible: boolean;
  onPress: () => void;
};

export default function ScrollToTopButton({
  visible,
  onPress,
}: ScrollToTopButtonProps) {
  if (!visible) return null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="回到頂部"
    >
      <Text style={styles.icon}>↑</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: space.xl,
    bottom: space.xxxl,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    fontSize: type.heading,
    fontWeight: '700',
    color: colors.text,
  },
});
