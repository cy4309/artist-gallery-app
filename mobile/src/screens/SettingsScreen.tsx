import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as Notifications from "expo-notifications";
import { SafeAreaView } from "react-native-safe-area-context";

import { fetchFavoriteList } from "../api/favorites";
import { registerPushToken, sendTestPush } from "../api/push";
import { ApiError } from "../api/errors";
import { useAuth } from "../auth/AuthContext";
import {
  setEventRemindersEnabled,
  setInstantFavoriteNotify,
} from "../notifications/eventReminders";
import {
  loadEventRemindersEnabled,
  loadInstantFavoriteNotify,
} from "../notifications/prefs";
import { registerForPushNotificationsAsync } from "../notifications/registerForPush";
import { colors, radius, space, type } from "../theme/tokens";

type Status = "idle" | "loading" | "success" | "error";

function formatRegisterError(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return "Token 已取得，但 production 還沒有 /api/push/register（404）。請先 deploy frontend。";
  }

  if (error instanceof ApiError && error.status === 502) {
    return `Token 已取得，但 GAS 寫入失敗：${error.message}`;
  }

  if (error instanceof ApiError && error.code === "TIMEOUT") {
    return "Token 已取得，但等後端回應逾時。若 Sheet 的 updatedAt 有更新，其實已註冊成功（GAS 較慢）。";
  }

  const apiMessage =
    error instanceof ApiError ? error.message : "Unknown error";
  return `Token 已取得，但後端註冊失敗：${apiMessage}`;
}

export default function SettingsScreen() {
  const { user, loading: authLoading } = useAuth();
  const [remindersOn, setRemindersOn] = useState(true);
  const [instantTestOn, setInstantTestOn] = useState(false);
  const [permission, setPermission] = useState<string>("undetermined");
  const [busy, setBusy] = useState(false);
  const [testBusy, setTestBusy] = useState(false);

  const [status, setStatus] = useState<Status>("idle");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [sendStatus, setSendStatus] = useState<Status>("idle");
  const [sendMessage, setSendMessage] = useState("");

  const refreshPermission = useCallback(async () => {
    const current = await Notifications.getPermissionsAsync();
    setPermission(current.status);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user]);

  useEffect(() => {
    void (async () => {
      setRemindersOn(await loadEventRemindersEnabled());
      setInstantTestOn(await loadInstantFavoriteNotify());
      await refreshPermission();
    })();
  }, [refreshPermission]);

  async function handleToggle(next: boolean) {
    if (busy) return;
    setBusy(true);
    setRemindersOn(next);
    try {
      const list = user
        ? (await fetchFavoriteList()).map((item) => ({
            eventId: String(item.eventId),
            eventTitle: item.eventTitle,
            eventStartDate: item.eventStartDate,
          }))
        : [];
      await setEventRemindersEnabled(next, list, user?.id);
      await refreshPermission();
    } catch {
      setRemindersOn(!next);
    } finally {
      setBusy(false);
    }
  }

  async function handleInstantTestToggle(next: boolean) {
    if (testBusy) return;
    setTestBusy(true);
    setInstantTestOn(next);
    try {
      await setInstantFavoriteNotify(next, user?.id);
      await refreshPermission();
    } catch {
      setInstantTestOn(!next);
    } finally {
      setTestBusy(false);
    }
  }

  async function handleRegister() {
    setStatus("loading");
    setRegisterMessage("");
    setSendMessage("");
    setSendStatus("idle");

    const result = await registerForPushNotificationsAsync();

    if (!result.ok) {
      setToken("");
      setMessage(result.message);
      setStatus("error");
      return;
    }

    setToken(result.token);
    setMessage("");

    try {
      const response = await registerPushToken({
        expoPushToken: result.token,
        platform: Platform.OS === "ios" ? "ios" : "android",
        userId: user?.id,
      });

      if (response.stub) {
        setRegisterMessage("已送到 API（開發模式 stub，尚未寫入 GAS）");
      } else if (response.created) {
        setRegisterMessage("Token 已註冊到後端");
      } else {
        setRegisterMessage("Token 已更新到後端");
      }

      setStatus("success");
    } catch (error) {
      setRegisterMessage(formatRegisterError(error));
      setStatus("success");
    }
  }

  async function handleSendTest() {
    if (!token) return;

    setSendStatus("loading");
    setSendMessage("");

    try {
      const response = await sendTestPush({
        expoPushToken: token,
        title: "CYC ZINE",
        body: "測試推播成功！你的裝置已能收到通知。",
      });

      if (!response.success) {
        setSendMessage(response.error || "推播失敗");
        setSendStatus("error");
        return;
      }

      setSendMessage("已送出測試推播。若沒跳出，請把 App 切到背景再試。");
      setSendStatus("success");
    } catch (error) {
      const apiMessage =
        error instanceof ApiError ? error.message : "Unknown error";
      setSendMessage(
        error instanceof ApiError && error.status === 404
          ? "production 還沒有 /api/push/send，請先 deploy frontend。"
          : apiMessage,
      );
      setSendStatus("error");
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.heading}>帳號設定</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>活動提醒</Text>
        <Text style={styles.sectionBody}>
          登入並收藏活動後，會在開始前一天上午 9
          點（台灣時間）通知你。開始日已不到一天則不排提醒。
        </Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>開啟活動提醒</Text>
          {busy ? (
            <ActivityIndicator color={colors.border} />
          ) : (
            <Switch
              value={remindersOn}
              onValueChange={handleToggle}
              trackColor={{ false: colors.borderMuted, true: colors.text }}
              thumbColor={colors.text}
            />
          )}
        </View>

        {permission === "denied" ? (
          <Pressable onPress={() => Linking.openSettings()}>
            <Text style={styles.link}>系統通知已關閉，前往設定開啟</Text>
          </Pressable>
        ) : null}

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>測試：收藏即通知</Text>
            <Text style={styles.rowHint}>開啟後，按愛心會立刻跳出通知</Text>
          </View>
          {testBusy ? (
            <ActivityIndicator color={colors.border} />
          ) : (
            <Switch
              value={instantTestOn}
              onValueChange={handleInstantTestToggle}
              trackColor={{ false: colors.borderMuted, true: colors.text }}
              thumbColor={colors.text}
            />
          )}
        </View>
      </View>

      {__DEV__ ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>開發：測試推播</Text>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed,
              status === "loading" && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <Text style={styles.buttonText}>取得並註冊 Push Token</Text>
            )}
          </Pressable>

          {status === "success" && token ? (
            <View style={styles.tokenBox}>
              <Text style={styles.tokenLabel}>Expo Push Token</Text>
              <Text style={styles.tokenValue} selectable>
                {token}
              </Text>
              {registerMessage ? (
                <Text style={styles.registerMessage}>{registerMessage}</Text>
              ) : null}

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                  sendStatus === "loading" && styles.buttonDisabled,
                ]}
                onPress={handleSendTest}
                disabled={sendStatus === "loading"}
              >
                {sendStatus === "loading" ? (
                  <ActivityIndicator color={colors.text} />
                ) : (
                  <Text style={styles.secondaryButtonText}>傳送測試推播</Text>
                )}
              </Pressable>

              {sendMessage ? (
                <Text
                  style={
                    sendStatus === "error"
                      ? styles.error
                      : styles.registerMessage
                  }
                >
                  {sendMessage}
                </Text>
              ) : null}
            </View>
          ) : null}

          {status === "error" && message ? (
            <Text style={styles.error}>{message}</Text>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.lg,
  },
  heading: {
    fontSize: type.heading,
    fontWeight: "700",
    letterSpacing: 2,
    color: colors.text,
  },
  section: {
    paddingHorizontal: space.xl,
    gap: space.md,
    marginBottom: space.xxl,
  },
  sectionTitle: {
    fontSize: type.heading,
    fontWeight: "600",
    color: colors.text,
  },
  sectionBody: {
    fontSize: type.meta,
    lineHeight: 20,
    color: colors.textMuted,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: space.xs,
  },
  rowLabel: {
    fontSize: type.body,
    color: colors.text,
  },
  rowText: {
    flex: 1,
    paddingRight: space.md,
  },
  rowHint: {
    marginTop: 2,
    fontSize: type.caption,
    color: colors.textMuted,
  },
  link: {
    fontSize: type.meta,
    color: colors.accentSoft,
    lineHeight: 20,
  },
  button: {
    marginTop: space.sm,
    backgroundColor: colors.text,
    borderRadius: 8,
    paddingVertical: space.md,
    alignItems: "center",
  },
  secondaryButton: {
    marginTop: space.sm,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: space.md,
    alignItems: "center",
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: colors.bg,
    fontSize: type.body,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "600",
  },
  tokenBox: {
    marginTop: space.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    padding: space.lg,
    gap: space.sm,
  },
  tokenLabel: {
    fontSize: type.meta,
    fontWeight: "600",
    color: colors.text,
  },
  tokenValue: {
    fontSize: type.caption,
    lineHeight: 18,
    color: colors.textMuted,
  },
  registerMessage: {
    fontSize: type.meta,
    color: colors.accentSoft,
    lineHeight: 18,
  },
  error: {
    fontSize: type.meta,
    color: colors.danger,
    lineHeight: 20,
  },
});
