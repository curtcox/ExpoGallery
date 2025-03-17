import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Pedometer } from 'expo-sensors';
import { EventSubscription } from 'expo-modules-core';
import { info, error, warn } from '@/utils/logger';

export default function App() {
  const [isPedometerAvailable, setIsPedometerAvailable] = useState('checking');
  const [pastStepCount, setPastStepCount] = useState(0);
  const [currentStepCount, setCurrentStepCount] = useState(0);
  const [subscription, setSubscription] = useState<EventSubscription | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subscribe = async () => {
    try {
      info('Pedometer object:', Pedometer);
      info('Pedometer methods:', Object.getOwnPropertyNames(Pedometer));

      // Request permissions first
      const { status } = await Pedometer.requestPermissionsAsync();
      info('Permission status:', status);
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        warn('Pedometer permission not granted');
        setErrorMessage('Pedometer permission not granted');
        return;
      }

      // Check availability
      const isAvailable = await Pedometer.isAvailableAsync();
      info('Pedometer available:', isAvailable);
      setIsPedometerAvailable(String(isAvailable));

      if (isAvailable) {
        try {
          const end = new Date();
          const start = new Date();
          start.setDate(end.getDate() - 1);

          info('Fetching step count for last 24 hours');
          const pastStepCountResult = await Pedometer.getStepCountAsync(start, end);
          if (pastStepCountResult) {
            info('Past step count:', pastStepCountResult.steps);
            setPastStepCount(pastStepCountResult.steps);
          }

          info('Setting up step count watcher');
          const newSubscription = Pedometer.watchStepCount(result => {
            info('New step count update:', result.steps);
            setCurrentStepCount(result.steps);
          });

          setSubscription(newSubscription);
          return newSubscription;
        } catch (e: any) {
          error('Error setting up pedometer:', e);
          setErrorMessage(`Error setting up pedometer: ${e.message}`);
        }
      } else {
        warn('Pedometer is not available on this device');
        setErrorMessage('Pedometer is not available on this device');
      }
    } catch (e: any) {
      error('Error in subscribe:', e);
      setErrorMessage(`Error in subscribe: ${e.message}`);
    }
  };

  const unsubscribe = () => {
    if (subscription) {
      info('Removing pedometer subscription');
      subscription.remove();
      setSubscription(null);
    }
  };

  useEffect(() => {
    const setupSubscription = async () => {
      const result = await subscribe();
      setSubscription(result || null);
    };

    setupSubscription();
    return () => unsubscribe();
  }, []);

  // Render error message if permissions not granted
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Pedometer permission denied</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pedometer.isAvailableAsync(): {isPedometerAvailable}</Text>
      <Text style={styles.text}>Steps taken in the last 24 hours: {pastStepCount}</Text>
      <Text style={styles.text}>Walk! And watch this go up: {currentStepCount}</Text>

      {errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={subscription ? unsubscribe : subscribe} style={styles.button}>
          <Text>{subscription ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    textAlign: 'center',
    marginBottom: 5,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginTop: 15,
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
  },
});
