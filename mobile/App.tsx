import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';

import EventsScreen from './src/screens/EventsScreen';
import HomeScreen from './src/screens/HomeScreen';

type Screen = 'home' | 'events';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');

  return (
    <SafeAreaView style={styles.container}>
      {screen === 'home' ? (
        <HomeScreen onOpenEvents={() => setScreen('events')} />
      ) : (
        <EventsScreen onBack={() => setScreen('home')} />
      )}
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
});
