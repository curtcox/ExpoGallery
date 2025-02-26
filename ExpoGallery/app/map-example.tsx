import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Button, Alert } from 'react-native';
import MapView from '@/components/MapView';
import * as Location from 'expo-location';
import { info, error } from './log-example';
import { oneButtonAlert } from './alert-example';

export default function HomeScreen() {
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      // Request permission to access location
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const message = 'Permission to access location was denied';
        info(message);
        oneButtonAlert(message);
        return;
      }
      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      // Set region with a default zoom level
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  // Effect to center map once both the map is loaded and region is set
  useEffect(() => {
    if (mapLoaded && region && mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [mapLoaded, region]);

  // Function to recenter the map on the device's location
  const centerMap = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      } else {
        info("Map reference is not available");
      }
    } catch (e) {
      error("Error centering map:", e);
      oneButtonAlert('Failed to center map');
    }
  };

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          followsUserLocation={true}
          showsUserLocation={true}
          onMapReady={() => setMapLoaded(true)}
        />
      )}
      <View style={styles.buttonContainer}>
        <Button title="Center Map" onPress={centerMap} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
});
