import {
  Accelerometer,
  Barometer,
  DeviceMotion,
  Gyroscope,
  LightSensor,
  Magnetometer,
  MagnetometerUncalibrated,
  Pedometer,
} from 'expo-sensors';
import React, { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { StyleSheet, View, ScrollView } from 'react-native';
import { info, error } from '@/utils/logger';

// Define the type for our sensor availability state
interface SensorAvailability {
  [key: string]: boolean;
}

export default function Example() {
  const [sensorAvailability, setSensorAvailability] = useState<SensorAvailability>({
    Accelerometer: false,
    Barometer: false,
    DeviceMotion: false,
    Gyroscope: false,
    LightSensor: false,
    Magnetometer: false,
    MagnetometerUncalibrated: false,
    Pedometer: false
  });

  useEffect(() => {
    checkSensorsAvailability();
  }, []);

  const checkSensorsAvailability = async () => {
    try {
      const results = {
        Accelerometer: await Accelerometer.isAvailableAsync(),
        Barometer: await Barometer.isAvailableAsync(),
        DeviceMotion: await DeviceMotion.isAvailableAsync(),
        Gyroscope: await Gyroscope.isAvailableAsync(),
        LightSensor: await LightSensor.isAvailableAsync(),
        Magnetometer: await Magnetometer.isAvailableAsync(),
        MagnetometerUncalibrated: await MagnetometerUncalibrated.isAvailableAsync(),
        Pedometer: await Pedometer.isAvailableAsync()
      };

      setSensorAvailability(results);
      info('Sensor availability checked:', results);
    } catch (err) {
      error('Error checking sensor availability:', err);
    }
  };

  const renderSensorStatus = (sensorName: string, isAvailable: boolean) => {
    return (
      <View style={styles.sensorRow} key={sensorName}>
        <ThemedText style={styles.sensorName}>{sensorName}:</ThemedText>
        <ThemedText
          style={[
            styles.statusText,
            isAvailable ? styles.available : styles.unavailable
          ]}
        >
          {isAvailable ? 'Available' : 'Not Available'}
        </ThemedText>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.title}>Sensor Availability</ThemedText>
      {Object.entries(sensorAvailability).map(([sensor, isAvailable]) =>
        renderSensorStatus(sensor, isAvailable)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  sensorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc30',
  },
  sensorName: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  available: {
    color: '#4CAF50',
  },
  unavailable: {
    color: '#F44336',
  }
});