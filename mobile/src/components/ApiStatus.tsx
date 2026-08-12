import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { getOrgData } from '../api/org';
import { ApiError } from '../api/errors';

type Status = 'loading' | 'success' | 'error';

export default function ApiStatus() {
  const [status, setStatus] = useState<Status>('loading');
  const [eventCount, setEventCount] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setStatus('loading');
        const events = await getOrgData();

        if (cancelled) return;

        setEventCount(events.length);
        setStatus('success');
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError) {
          setErrorMessage(error.message);
        } else {
          setErrorMessage('Unknown error');
        }

        setStatus('error');
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#666" />
        <Text style={styles.text}>正在連線 Next.js API…</Text>
      </View>
    );
  }

  if (status === 'error') {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>API 連線失敗</Text>
        <Text style={styles.text}>{errorMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.successTitle}>API 連線成功</Text>
      <Text style={styles.text}>共取得 {eventCount} 筆活動資料</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    alignItems: 'center',
    gap: 8,
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#15803d',
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#b91c1c',
  },
  text: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },
});
