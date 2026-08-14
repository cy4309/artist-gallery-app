import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useAuth } from '../auth/AuthContext';
import { FavoriteExtra } from '../api/favorites';
import { colors, type } from '../theme/tokens';

type FavoriteButtonProps = {
  eventId: string;
  extra?: FavoriteExtra;
};

export default function FavoriteButton({ eventId, extra }: FavoriteButtonProps) {
  const { user, favoriteIds, toggleFavoriteForEvent, startLoginToFavorite } =
    useAuth();
  const isFavorite = favoriteIds.includes(eventId);
  const [busy, setBusy] = useState(false);

  async function onPress() {
    if (busy) return;
    if (!user) {
      startLoginToFavorite(eventId, extra);
      return;
    }
    setBusy(true);
    try {
      await toggleFavoriteForEvent(eventId, extra);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={isFavorite ? '取消收藏' : '加入收藏'}
    >
      <Text style={[styles.icon, isFavorite && styles.iconOn]}>
        {isFavorite ? '♥' : '♡'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  pressed: {
    opacity: 0.8,
  },
  icon: {
    fontSize: type.title,
    color: colors.text,
  },
  iconOn: {
    color: '#f87171',
  },
});
