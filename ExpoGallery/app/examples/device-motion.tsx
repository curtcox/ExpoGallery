import React, { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { info, error } from '@/utils/logger';
import { DeviceMotion } from 'expo-sensors';
import { StyleSheet, View, Button } from 'react-native';

// Define a simplified initial state that complies with the shape we need
type MotionState = {
  acceleration: { x: number; y: number; z: number; timestamp: number } | null;
  accelerationIncludingGravity: { x: number; y: number; z: number; timestamp: number } | null;
  rotation: { alpha: number; beta: number; gamma: number; timestamp: number } | null;
  orientation: number | null;
};

export default function Example() {
  const [motionData, setMotionData] = useState<MotionState>({
    acceleration: null,
    accelerationIncludingGravity: null,
    rotation: null,
    orientation: null,
  });
  const [subscription, setSubscription] = useState<{ remove: () => void } | null>(null);
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    checkAvailability();
    return () => {
      unsubscribe();
    };
  }, []);

  const checkAvailability = async () => {
    try {
      const available = await DeviceMotion.isAvailableAsync();
      setIsAvailable(available);
      if (!available) {
        error('DeviceMotion is not available on this device', new Error('Device not supported'));
      } else {
        info('DeviceMotion is available on this device');
      }
    } catch (err) {
      error('Failed to check DeviceMotion availability', err instanceof Error ? err : new Error(String(err)));
    }
  };

  const subscribe = async () => {
    unsubscribe();

    try {
      // Set update interval (in ms)
      DeviceMotion.setUpdateInterval(100);

      // Subscribe to DeviceMotion updates
      const newSubscription = DeviceMotion.addListener((deviceMotionData) => {
        setMotionData({
          acceleration: deviceMotionData.acceleration,
          accelerationIncludingGravity: deviceMotionData.accelerationIncludingGravity,
          rotation: deviceMotionData.rotation,
          orientation: deviceMotionData.orientation,
        });
      });

      setSubscription(newSubscription);
      info('Subscribed to DeviceMotion');
    } catch (err) {
      error('Failed to subscribe to DeviceMotion', err instanceof Error ? err : new Error(String(err)));
    }
  };

  const unsubscribe = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
      info('Unsubscribed from DeviceMotion');
    }
  };

  const formatValue = (value: number | null | undefined): string => {
    return value !== null && value !== undefined ? value.toFixed(3) : 'null';
  };

  return (
    <View style={styles.container}>
      <ThemedText style={styles.title}>Device Motion</ThemedText>

      <View style={styles.buttonContainer}>
        <Button
          title={subscription ? "Stop" : "Start"}
          onPress={subscription ? unsubscribe : subscribe}
          disabled={!isAvailable}
        />
      </View>

      {!isAvailable && (
        <ThemedText style={styles.errorText}>
          DeviceMotion is not available on this device
        </ThemedText>
      )}

      <View style={styles.dataContainer}>
        <ThemedText style={styles.sectionTitle}>Acceleration</ThemedText>
        <ThemedText>
          x: {formatValue(motionData.acceleration?.x)} g{'\n'}
          y: {formatValue(motionData.acceleration?.y)} g{'\n'}
          z: {formatValue(motionData.acceleration?.z)} g
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>Acceleration with Gravity</ThemedText>
        <ThemedText>
          x: {formatValue(motionData.accelerationIncludingGravity?.x)} g{'\n'}
          y: {formatValue(motionData.accelerationIncludingGravity?.y)} g{'\n'}
          z: {formatValue(motionData.accelerationIncludingGravity?.z)} g
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>Rotation</ThemedText>
        <ThemedText>
          alpha: {formatValue(motionData.rotation?.alpha)}°{'\n'}
          beta: {formatValue(motionData.rotation?.beta)}°{'\n'}
          gamma: {formatValue(motionData.rotation?.gamma)}°
        </ThemedText>

        <ThemedText style={styles.sectionTitle}>Orientation</ThemedText>
        <ThemedText>
          {motionData.orientation !== null ? `${motionData.orientation}°` : 'null'}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
  },
  dataContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});