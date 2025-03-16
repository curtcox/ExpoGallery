import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { Barometer } from 'expo-sensors';
import { EventSubscription } from 'expo-modules-core';
import { info, error, warn } from '@/utils/logger';

type Subscription = EventSubscription;

export default function App() {
  const [{ pressure, relativeAltitude }, setData] = useState({ pressure: 0, relativeAltitude: 0 });
  const [isActive, setIsActive] = useState(false);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const subscribe = async () => {
    try {
      // Log Barometer object to inspect its properties
      info('Barometer object:', Barometer);
      info('Barometer methods:', Object.getOwnPropertyNames(Barometer));

      // Check if _nativeModule exists and what it contains
      // @ts-ignore - Accessing internal property for debugging
      info('_nativeModule exists:', !!Barometer._nativeModule);
      // @ts-ignore - Accessing internal property for debugging
      if (Barometer._nativeModule) {
        // @ts-ignore - Accessing internal property for debugging
        info('_nativeModule methods:', Object.getOwnPropertyNames(Barometer._nativeModule));
      }

      // Request permissions if necessary
      if (typeof Barometer.requestPermissionsAsync === 'function') {
        const { status } = await Barometer.requestPermissionsAsync();
        info('Permission status:', status);
        setHasPermission(status === 'granted');

        if (status !== 'granted') {
          warn('Barometer permission not granted');
          setErrorMessage('Barometer permission not granted');
          return;
        }
      } else {
        // Some sensors might not require explicit permissions
        setHasPermission(true);
      }

      // Check if barometer is available
      if (typeof Barometer.isAvailableAsync === 'function') {
        const isAvailable = await Barometer.isAvailableAsync();
        info('Barometer available:', isAvailable);

        if (!isAvailable) {
          warn('Barometer is not available on this device');
          setErrorMessage('Barometer is not available on this device');
          return;
        }
      }

      try {
        // Check addListener exists directly before calling it
        info('addListener exists:', typeof Barometer.addListener === 'function');

        const newSubscription = Barometer.addListener(result => {
          setData({
            pressure: result.pressure,
            relativeAltitude: result.relativeAltitude || 0
          });
        });

        setSubscription(newSubscription);
        setErrorMessage(null);
      } catch (e: any) {
        error('Error adding barometer listener:', e);
        setErrorMessage(`Error adding barometer listener: ${e.message}`);
      }
    } catch (e: any) {
      error('Error in subscribe:', e);
      setErrorMessage(`Error in subscribe: ${e.message}`);
    }
  };

  const unsubscribe = () => {
    if (subscription) {
      subscription.remove();
    }
    setSubscription(null);
  };

  useEffect(() => {
    if (isActive) {
      subscribe();
    } else {
      unsubscribe();
    }

    return () => {
      unsubscribe();
    };
  }, [isActive]);

  const toggleListener = () => {
    setIsActive(prevState => !prevState);
  };

  // Render error message if permissions not granted
  if (hasPermission === false) {
    return (
      <View style={styles.wrapper}>
        <Text>Barometer permission denied</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrapper}>
      <Text>Barometer: Listener {isActive ? 'ACTIVE' : 'INACTIVE'}</Text>
      <Text>Pressure: {pressure} hPa</Text>
      <Text>
        Relative Altitude:{' '}
        {Platform.OS === 'ios' ? `${relativeAltitude} m` : `Only available on iOS`}
      </Text>

      {errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}

      <TouchableOpacity onPress={toggleListener} style={styles.button}>
        <Text>Toggle listener</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
    padding: 10,
    marginTop: 15,
  },
  wrapper: {
    flex: 1,
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 10,
  },
});
