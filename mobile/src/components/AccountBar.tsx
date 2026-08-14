import { Pressable, StyleSheet, Text, View } from "react-native";
import { router, usePathname } from "expo-router";

import { useAuth } from "../auth/AuthContext";
import { colors, space, type } from "../theme/tokens";

export default function AccountBar() {
  const { user, loading, logout, cancelPendingFavorite } = useAuth();
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/index";
  const isLogin = pathname === "/login";
  const isSettings = pathname === "/settings";

  async function onLogout() {
    await logout();
    if (pathname === "/favorites" || pathname === "/settings") {
      router.replace("/");
    }
  }

  function onBack() {
    if (isLogin) {
      cancelPendingFavorite();
    }
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/");
  }

  return (
    <View style={styles.bar}>
      {isHome ? (
        <View style={styles.backSlot} />
      ) : (
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <Text style={styles.back}>← 返回</Text>
        </Pressable>
      )}

      <View style={styles.account}>
        {user && !isSettings ? (
          <Pressable
            onPress={() => router.push("/settings")}
            hitSlop={8}
            style={styles.identityBtn}
          >
            <Text style={styles.identity} numberOfLines={1}>
              {loading ? " " : `Hi, ${user.name}`}
            </Text>
          </Pressable>
        ) : (
          <Text style={styles.identity} numberOfLines={1}>
            {loading ? " " : `Hi, ${user?.name || "訪客"}`}
          </Text>
        )}
        {isLogin ? null : user ? (
          <Pressable onPress={onLogout} hitSlop={12} style={styles.actionBtn}>
            <Text style={styles.action}>登出</Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push("/login")}
            hitSlop={12}
            style={styles.actionBtn}
          >
            <Text style={styles.action}>登入</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.xl,
    paddingVertical: space.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderMuted,
    backgroundColor: colors.bg,
  },
  backSlot: {
    minWidth: 72,
  },
  backBtn: {
    paddingVertical: 4,
    paddingRight: space.md,
    marginLeft: -space.sm,
  },
  back: {
    fontSize: type.body,
    fontWeight: "600",
    color: colors.text,
  },
  account: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    marginLeft: space.lg,
    gap: space.sm,
  },
  identityBtn: {
    flexShrink: 1,
  },
  identity: {
    flexShrink: 1,
    maxWidth: 220,
    fontSize: type.body,
    color: colors.textMuted,
  },
  actionBtn: {
    paddingVertical: 4,
    paddingLeft: space.sm,
    marginRight: -space.sm,
  },
  action: {
    fontSize: type.body,
    fontWeight: "700",
    color: colors.text,
  },
});
