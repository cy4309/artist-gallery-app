import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, usePathname } from 'expo-router';

import { useAuth } from '../auth/AuthContext';
import { colors, space, type } from '../theme/tokens';

export default function AccountBar() {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  if (pathname === '/login') {
    return null;
  }

  async function onLogout() {
    await logout();
    if (pathname === '/favorites') {
      router.replace('/');
    }
  }

  return (
    <View style={styles.bar}>
      <Text style={styles.identity} numberOfLines={1}>
        {loading ? ' ' : user?.name || '訪客'}
      </Text>
      {user ? (
        <Pressable onPress={onLogout} hitSlop={8}>
          <Text style={styles.action}>登出</Text>
        </Pressable>
      ) : (
        <Pressable onPress={() => router.push('/login')} hitSlop={8}>
          <Text style={styles.action}>登入</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: space.xl,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
    backgroundColor: colors.bg,
  },
  identity: {
    flex: 1,
    marginRight: space.md,
    fontSize: type.meta,
    color: colors.textMuted,
  },
  action: {
    fontSize: type.meta,
    fontWeight: '700',
    color: colors.text,
  },
});
