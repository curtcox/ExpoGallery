import { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import HomeScreen_1 from '../index_1';
import HomeScreen_2 from '../index_2';
import HomeScreen_3 from '../index_3';
import { currentSettings, subscribeToSettingsChanges } from './settings';

export default function HomeScreen() {
  const [settings, setSettings] = useState(currentSettings());

  // Subscribe to settings changes
  useEffect(() => {
    const unsubscribe = subscribeToSettingsChanges((newSettings) => {
      setSettings({...newSettings});
    });

    return () => unsubscribe();
  }, []);

  // Render the appropriate UI based on the settings level
  return (
    <ThemedView style={styles.container}>
      {settings.UI_Level === 1 && <HomeScreen_1 />}
      {settings.UI_Level === 2 && <HomeScreen_2 />}
      {settings.UI_Level === 3 && <HomeScreen_3 />}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
