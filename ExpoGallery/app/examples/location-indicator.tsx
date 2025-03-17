import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import * as Location from 'expo-location';
import { getCurrentLocation } from '@/services/location';
import LocationIndicator from '@/components/LocationIndicator';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { error, oneButtonAlert } from '@/utils/index';

export default function LocationIndicatorExample() {
  const [hasLocation, setHasLocation] = useState<boolean | null>(null);
  const [locationText, setLocationText] = useState<string>('Location status unknown');
  const [lastRequested, setLastRequested] = useState<Date | null>(null);
  const [lastReceived, setLastReceived] = useState<Date | null>(null);

  // Request location permissions when the component mounts
  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Format timestamp for display
  const formatTimestamp = (timestamp: Date | null): string => {
    if (!timestamp) return 'Never';
    return timestamp.toLocaleTimeString();
  };

  // Calculate time difference between request and receipt in seconds
  const calculateTimeDifference = (): string => {
    if (!lastRequested || !lastReceived) return 'N/A';

    const diffMs = lastReceived.getTime() - lastRequested.getTime();
    const diffSeconds = (diffMs / 1000).toFixed(2);
    return `${diffSeconds} seconds`;
  };

  // Request permission to access the device's location
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setHasLocation(false);
        setLocationText('Location permission was denied');
        oneButtonAlert('Location permission is required to use this feature');
        return;
      }

      // Permission granted, try to get current location
      checkLocation();
    } catch (err) {
      error('Error requesting location permission:', err);
      setHasLocation(false);
      setLocationText('Error requesting location permission');
    }
  };

  // Check if we can get the current location
  const checkLocation = async () => {
    try {
      // Update last requested timestamp
      const requestTime = new Date();
      setLastRequested(requestTime);

      setLocationText('Checking location...');
      const location = await getCurrentLocation();

      if (location && location.coords) {
        // Update last received timestamp
        setLastReceived(new Date());

        setHasLocation(true);
        setLocationText(
          `Location available!\nLatitude: ${location.coords.latitude.toFixed(6)}\nLongitude: ${location.coords.longitude.toFixed(6)}`
        );
      } else {
        setHasLocation(false);
        setLocationText('Location not available');
      }
    } catch (err) {
      error('Error getting location:', err);
      setHasLocation(false);
      setLocationText('Error getting location');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <LocationIndicator
        hasLocation={hasLocation}
        size={20}
        top={40}
        right={20}
      />

      <ThemedText style={styles.title}>Location Indicator Example</ThemedText>

      <View style={styles.statusContainer}>
        <ThemedText style={styles.statusTitle}>Location Status:</ThemedText>
        <ThemedText style={styles.statusText}>{locationText}</ThemedText>

        <View style={styles.timeInfo}>
          <ThemedText style={styles.timeLabel}>Last requested: <ThemedText style={styles.timeValue}>{formatTimestamp(lastRequested)}</ThemedText></ThemedText>
          <ThemedText style={styles.timeLabel}>Last received: <ThemedText style={styles.timeValue}>{formatTimestamp(lastReceived)}</ThemedText></ThemedText>
          <ThemedText style={styles.timeLabel}>Response time: <ThemedText style={styles.timeValue}>{calculateTimeDifference()}</ThemedText></ThemedText>
        </View>

        <View style={styles.indicatorExplanation}>
          <View style={styles.indicatorRow}>
            <View style={[styles.sampleIndicator, styles.solidIndicator]} />
            <ThemedText style={styles.indicatorText}>Solid circle = Location available</ThemedText>
          </View>

          <View style={styles.indicatorRow}>
            <View style={[styles.sampleIndicator, styles.emptyIndicator]} />
            <ThemedText style={styles.indicatorText}>Empty circle = Location not available</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Check Location Again"
          onPress={checkLocation}
        />

        <View style={styles.buttonSpacer} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginVertical: 20,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 16,
  },
  timeInfo: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 16,
  },
  timeLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  timeValue: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginTop: 20,
  },
  buttonSpacer: {
    height: 16,
  },
  indicatorExplanation: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 16,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  sampleIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  solidIndicator: {
    backgroundColor: '#2196F3',
  },
  emptyIndicator: {
    borderWidth: 1.5,
    borderColor: '#2196F3',
  },
  indicatorText: {
    fontSize: 14,
  },
});