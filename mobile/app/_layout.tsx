import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { AuthProvider } from '../src/auth/AuthContext';
import AccountBar from '../src/components/AccountBar';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={styles.root}>
          <SafeAreaView edges={['top']} style={styles.top}>
            <AccountBar />
          </SafeAreaView>
          <View style={styles.stack}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: '#000000' },
              }}
            />
          </View>
        </View>
        <StatusBar style="light" />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
  top: {
    backgroundColor: '#000000',
  },
  stack: {
    flex: 1,
  },
});

