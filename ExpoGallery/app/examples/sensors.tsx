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
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { info, error } from '@/utils/logger';
import { router } from 'expo-router';

// Define the type for our sensor availability state
interface SensorAvailability {
  [key: string]: boolean;
}

// Mapping of sensor names to their file paths
const sensorPaths: {[key: string]: string} = {
  Accelerometer: 'accelerometer',
  Barometer: 'barometer',
  DeviceMotion: 'device-motion',
  Gyroscope: 'gyroscope',
  LightSensor: 'light-sensor',
  Magnetometer: 'magnetometer',
  MagnetometerUncalibrated: 'magnetometer', // Use the regular magnetometer example
  Pedometer: 'pedometer'
};

export default function Example() {
  const [sensorAvailability, setSensorAvailability] = useState<SensorAvailability>({
    Accelerometer: false,
    Barometer: false,
    DeviceMotion: false,
    Gyroscope: false,
    LightSensor: false,
    Magnetometer: false,
    Magnetometer_Uncalibrated: false,
    Pedometer: false
  });

  useEffect(() => {
    checkSensorsAvailability();
  }, []);

  const checkSensorsAvailability = async () => {
    try {
      const results = {
        Accelerometer:            await Accelerometer.isAvailableAsync(),
        Barometer:                await Barometer.isAvailableAsync(),
        DeviceMotion:             await DeviceMotion.isAvailableAsync(),
        Gyroscope:                await Gyroscope.isAvailableAsync(),
        LightSensor:              await LightSensor.isAvailableAsync(),
        Magnetometer:             await Magnetometer.isAvailableAsync(),
        MagnetometerUncalibrated: await MagnetometerUncalibrated.isAvailableAsync(),
        Pedometer:                await Pedometer.isAvailableAsync()
      };

      setSensorAvailability(results);
      info('Sensor availability checked:', results);
    } catch (err) {
      error('Error checking sensor availability:', err);
    }
  };

  const renderSensorStatus = (sensorName: string, isAvailable: boolean) => {
    const sensorPath = sensorPaths[sensorName];

    const navigateToSensor = () => {
      if (sensorPath) {
        info(`Navigating to sensor example: ${sensorPath}`);
        router.push(`/examples/${sensorPath}` as any);
      } else {
        error(`No example path found for sensor:`, sensorName);
      }
    };

    return (
      <View style={styles.sensorRow} key={sensorName}>
        <TouchableOpacity onPress={navigateToSensor} style={styles.sensorNameContainer}>
          <ThemedText style={[styles.sensorName, styles.linkText]}>{sensorName}</ThemedText>
        </TouchableOpacity>
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
  sensorNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sensorName: {
    fontSize: 16,
    fontWeight: '500',
  },
  linkText: {
    color: '#2196F3',
    textDecorationLine: 'underline',
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