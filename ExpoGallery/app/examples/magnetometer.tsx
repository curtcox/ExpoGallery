import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { EventSubscription } from 'expo-modules-core';
import { info, error, warn } from '@/utils/logger';

export default function Compass() {
  const [{ x, y, z }, setData] = useState({
    x: 0,
    y: 0,
    z: 0,
  });
  const [subscription, setSubscription] = useState<EventSubscription | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const _slow = () => Magnetometer.setUpdateInterval(1000);
  const _fast = () => Magnetometer.setUpdateInterval(16);

  const _subscribe = async () => {
    try {
      // Log Magnetometer object to inspect its properties
      info('Magnetometer object:', Magnetometer);
      info('Magnetometer methods:', Object.getOwnPropertyNames(Magnetometer));

      // Check if _nativeModule exists and what it contains
      // @ts-ignore - Accessing internal property for debugging
      info('_nativeModule exists:', !!Magnetometer._nativeModule);
      // @ts-ignore - Accessing internal property for debugging
      if (Magnetometer._nativeModule) {
        // @ts-ignore - Accessing internal property for debugging
        info('_nativeModule methods:', Object.getOwnPropertyNames(Magnetometer._nativeModule));
      }

      // Request permissions first
      const { status } = await Magnetometer.requestPermissionsAsync();
      info('Permission status:', status);
      setHasPermission(status === 'granted');

      if (status === 'granted') {
        // Make sure the magnetometer is available
        const isAvailable = await Magnetometer.isAvailableAsync();
        info('Magnetometer available:', isAvailable);

        if (isAvailable) {
          try {
            // Check addListener exists directly before calling it
            info('addListener exists:', typeof Magnetometer.addListener === 'function');
            setSubscription(Magnetometer.addListener(setData));
          } catch (e: any) {
            error('Error adding listener:', e);
            setErrorMessage(`Error adding listener: ${e.message}`);
          }
        } else {
          warn('Magnetometer is not available on this device');
          setErrorMessage('Magnetometer is not available on this device');
        }
      }
    } catch (e: any) {
      error('Error in _subscribe:', e);
      setErrorMessage(`Error in subscribe: ${e.message}`);
    }
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  // Render error message if permissions not granted
  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Magnetometer permission denied</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Magnetometer:</Text>
      <Text style={styles.text}>x: {x}</Text>
      <Text style={styles.text}>y: {y}</Text>
      <Text style={styles.text}>z: {z}</Text>

      {errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={subscription ? _unsubscribe : _subscribe} style={styles.button}>
          <Text>{subscription ? 'On' : 'Off'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_slow} style={[styles.button, styles.middleButton]}>
          <Text>Slow</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={_fast} style={styles.button}>
          <Text>Fast</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  text: {
    textAlign: 'center',
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
  middleButton: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#ccc',
  },
});
