import { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { registerPushToken } from '../api/push';
import { ApiError } from '../api/errors';
import { registerForPushNotificationsAsync } from '../notifications/registerForPush';

type Status = 'idle' | 'loading' | 'success' | 'error';

function formatRegisterError(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) {
    return 'Token 已取得，但 production 還沒有 /api/push/register（404）。請改打本機 Next.js，或先 deploy frontend。';
  }

  const apiMessage =
    error instanceof ApiError ? error.message : 'Unknown error';
  return `Token 已取得，但後端註冊失敗：${apiMessage}`;
}

export default function SettingsScreen() {
  const [status, setStatus] = useState<Status>('idle');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');

  async function handleRegister() {
    setStatus('loading');
    setRegisterMessage('');

    const result = await registerForPushNotificationsAsync();

    if (!result.ok) {
      setToken('');
      setMessage(result.message);
      setStatus('error');
      return;
    }

    setToken(result.token);
    setMessage('');

    try {
      const response = await registerPushToken({
        expoPushToken: result.token,
        platform: Platform.OS === 'ios' ? 'ios' : 'android',
      });

      if (response.stub) {
        setRegisterMessage('已送到 API（開發模式 stub，尚未寫入 GAS）');
      } else if (response.created) {
        setRegisterMessage('Token 已註冊到後端');
      } else {
        setRegisterMessage('Token 已更新到後端');
      }

      setStatus('success');
    } catch (error) {
      setRegisterMessage(formatRegisterError(error));
      setStatus('success');
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Text style={styles.back}>← 返回</Text>
        </Pressable>
        <Text style={styles.heading}>設定</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Push Notification</Text>
        <Text style={styles.sectionBody}>
          取得 Expo Push Token 後，自動 POST 到 Next.js{' '}
          <Text style={styles.mono}>/api/push/register</Text> 儲存。
        </Text>

        <Pressable
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
            status === 'loading' && styles.buttonDisabled,
          ]}
          onPress={handleRegister}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>取得並註冊 Push Token</Text>
          )}
        </Pressable>

        {status === 'success' && token ? (
          <View style={styles.tokenBox}>
            <Text style={styles.tokenLabel}>Expo Push Token</Text>
            <Text style={styles.tokenValue} selectable>
              {token}
            </Text>
            <Text style={styles.platform}>
              平台：{Platform.OS === 'ios' ? 'iOS' : 'Android'}
            </Text>
            {registerMessage ? (
              <Text style={styles.registerMessage}>{registerMessage}</Text>
            ) : null}
          </View>
        ) : null}

        {status === 'error' && message ? (
          <Text style={styles.error}>{message}</Text>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  back: {
    fontSize: 16,
    color: '#111',
    width: 72,
  },
  heading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111',
  },
  headerSpacer: {
    width: 72,
  },
  section: {
    paddingHorizontal: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  mono: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace' }),
    fontSize: 13,
    color: '#333',
  },
  button: {
    marginTop: 8,
    backgroundColor: '#111',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  tokenBox: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    padding: 16,
    gap: 8,
  },
  tokenLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111',
  },
  tokenValue: {
    fontSize: 12,
    lineHeight: 18,
    color: '#333',
  },
  platform: {
    fontSize: 12,
    color: '#666',
  },
  registerMessage: {
    fontSize: 13,
    color: '#15803d',
    lineHeight: 18,
  },
  error: {
    fontSize: 14,
    color: '#b91c1c',
    lineHeight: 20,
  },
});
