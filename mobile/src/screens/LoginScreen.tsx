import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { useAuth } from '@/auth/AuthContext';
import { env } from '@/config/env';
import { User } from '@/types/user';
import { colors, radius, space, type } from '@/theme/tokens';

WebBrowser.maybeCompleteAuthSession();

function parseSessionFromUrl(url: string): User | null {
  try {
    const parsed = Linking.parse(url);
    const session = parsed.queryParams?.session;
    const raw = Array.isArray(session) ? session[0] : session;
    if (typeof raw !== 'string' || !raw) return null;
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export default function LoginScreen() {
  const { completeLogin } = useAuth();
  const [errorMessage, setErrorMessage] = useState('');
  const [busy, setBusy] = useState<'google' | 'line' | null>(null);

  async function loginWithProvider(
    provider: 'google' | 'line',
    path: string
  ) {
    setErrorMessage('');
    setBusy(provider);
    try {
      const returnTo = Linking.createURL('/');
      const authUrl = `${env.apiUrl}${path}?returnTo=${encodeURIComponent(returnTo)}`;
      const result = await WebBrowser.openAuthSessionAsync(authUrl, returnTo);
      if (result.type !== 'success' || !('url' in result) || !result.url) {
        return;
      }
      const user = parseSessionFromUrl(result.url);
      if (!user?.id) {
        setErrorMessage('登入未帶回使用者資料');
        return;
      }
      await completeLogin(user);
      router.back();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '登入失敗');
    } finally {
      setBusy(null);
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="light" />
      <View style={styles.header}>
        <Text style={styles.heading}>登入</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>登入後即可收藏活動</Text>
        <Text style={styles.subtitle}>與網站同一組 Google／LINE 帳號</Text>

        <Pressable
          style={({ pressed }) => [styles.lineButton, pressed && styles.pressed]}
          onPress={() => loginWithProvider('line', '/api/auth/app-login-line')}
          disabled={busy !== null}
        >
          {busy === 'line' ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>使用 LINE 登入</Text>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.googleButton, pressed && styles.pressed]}
          onPress={() => loginWithProvider('google', '/api/auth/login')}
          disabled={busy !== null}
        >
          {busy === 'google' ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.buttonText}>使用 Google 登入</Text>
          )}
        </Pressable>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>
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
    fontWeight: '700',
    letterSpacing: 2,
    color: colors.text,
  },
  body: {
    paddingHorizontal: space.xxl,
    paddingTop: space.xxxl,
    gap: space.md,
  },
  title: {
    fontSize: type.title,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    marginBottom: space.lg,
    fontSize: type.meta,
    color: colors.textMuted,
  },
  lineButton: {
    backgroundColor: '#00C300',
    borderRadius: radius.md,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    borderRadius: radius.md,
    paddingVertical: space.lg,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.85,
  },
  buttonText: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: '700',
  },
  error: {
    marginTop: space.md,
    color: colors.danger,
    fontSize: type.meta,
  },
});
