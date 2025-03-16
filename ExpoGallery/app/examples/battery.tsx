import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import * as Battery from 'expo-battery';
import { EventSubscription } from 'expo-modules-core';
import { info, error, warn } from '@/utils/logger';

export default function App() {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [subscription, setSubscription] = useState<EventSubscription | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const _subscribe = async () => {
    try {
      info('Initializing battery monitoring');

      // Check if battery module is available
      const isAvailable = await Battery.isAvailableAsync();
      info('Battery API available:', isAvailable);

      if (!isAvailable) {
        warn('Battery API is not available on this device');
        setErrorMessage('Battery API is not available on this device');
        return;
      }

      // Get initial battery level
      try {
        const level = await Battery.getBatteryLevelAsync();
        info('Initial battery level:', level);
        setBatteryLevel(level);
      } catch (e: any) {
        error('Error getting battery level:', e);
        setErrorMessage(`Error getting battery level: ${e.message}`);
      }

      // Subscribe to battery level updates
      try {
        info('Setting up battery level subscription');
        const batterySubscription = Battery.addBatteryLevelListener(({ batteryLevel }) => {
          info('Battery level changed:', batteryLevel);
          setBatteryLevel(batteryLevel);
        });
        setSubscription(batterySubscription);
      } catch (e: any) {
        error('Error setting up battery subscription:', e);
        setErrorMessage(`Error setting up battery subscription: ${e.message}`);
      }
    } catch (e: any) {
      error('Error in battery setup:', e);
      setErrorMessage(`Error in battery setup: ${e.message}`);
    }
  };

  const _unsubscribe = () => {
    info('Removing battery subscription');
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  return (
    <View style={styles.container}>
      {batteryLevel !== null ? (
        <Text style={styles.text}>Current Battery Level: {(batteryLevel * 100).toFixed(0)}%</Text>
      ) : (
        <Text style={styles.text}>Loading battery information...</Text>
      )}

      {errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 10,
  },
});
