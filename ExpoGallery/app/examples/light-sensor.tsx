import { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { LightSensor } from 'expo-sensors';
import { EventSubscription } from 'expo-modules-core';
import { info, error, warn } from '@/utils/logger';

export default function App() {
  const [{ illuminance }, setData] = useState({ illuminance: 0 });
  const [subscription, setSubscription] = useState<EventSubscription | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggle = () => {
    if (subscription) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  const subscribe = async () => {
    try {
      // Log LightSensor object to inspect its properties
      info('LightSensor object:', LightSensor);

      // Request permissions first (if applicable)
      if (typeof LightSensor.requestPermissionsAsync === 'function') {
        const { status } = await LightSensor.requestPermissionsAsync();
        info('Permission status:', status);
        setHasPermission(status === 'granted');

        if (status !== 'granted') {
          warn('Light sensor permission not granted');
          setErrorMessage('Light sensor permission not granted');
          return;
        }
      } else {
        // If no permission method exists, assume it's available
        setHasPermission(true);
      }

      // Check if the sensor is available
      const isAvailable = typeof LightSensor.isAvailableAsync === 'function'
        ? await LightSensor.isAvailableAsync()
        : true;

      info('LightSensor available:', isAvailable);

      if (isAvailable) {
        try {
          setSubscription(LightSensor.addListener(sensorData => {
            setData(sensorData);
          }));
          info('Light sensor listener added successfully');
        } catch (e: any) {
          error('Error adding light sensor listener:', e);
          setErrorMessage(`Error adding listener: ${e.message}`);
        }
      } else {
        warn('Light sensor is not available on this device');
        setErrorMessage('Light sensor is not available on this device');
      }
    } catch (e: any) {
      error('Error in subscribe:', e);
      setErrorMessage(`Error in subscribe: ${e.message}`);
    }
  };

  const unsubscribe = () => {
    try {
      if (subscription) {
        subscription.remove();
        info('Light sensor listener removed');
      }
      setSubscription(null);
    } catch (e: any) {
      error('Error removing light sensor listener:', e);
      setErrorMessage(`Error removing listener: ${e.message}`);
    }
  };

  useEffect(() => {
    subscribe();
    return () => unsubscribe();
  }, []);

  // Render error message if permissions not granted
  if (hasPermission === false) {
    return (
      <View style={styles.sensor}>
        <Text style={styles.text}>Light sensor permission denied</Text>
      </View>
    );
  }

  return (
    <View style={styles.sensor}>
      <Text style={styles.text}>Light Sensor:</Text>
      <Text style={styles.text}>
        Illuminance: {Platform.OS === 'android' ? `${illuminance} lx` : `Only available on Android`}
      </Text>

      {errorMessage && (
        <Text style={styles.errorText}>{errorMessage}</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={toggle} style={styles.button}>
          <Text>{subscription ? 'Stop' : 'Start'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sensor: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
});
