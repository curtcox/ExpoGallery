import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Button, Image } from 'react-native';
import MapView, { Marker } from '@/components/MapView';
import * as Location from 'expo-location';
import { info, error, oneButtonAlert } from '@/utils/index';
import { router } from 'expo-router';
import { getAllResources, Resource } from '@/services/data';

// Map of resource categories to specific pin images
const categoryImages: { [key: string]: any } = {
  shelter: require('../../assets/images/react-logo.png'),
  food: require('../../assets/images/react-logo.png'),
  other: require('../../assets/images/react-logo.png'),
};

export default function MapScreen() {
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  // Create state to hold resources
  const [resources, setResources] = useState<Resource[]>([]);

  // Load resources on component mount
  useEffect(() => {
    setResources(getAllResources());
  }, []);

  // Request permission and fetch the device's current location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const message = 'Permission to access location was denied';
        info(message);
        oneButtonAlert(message);
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
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

  const handleMarkerPress = (resource: Resource) => {
    console.log({resource});
    router.push({
      pathname: '/resource',
      params: { id: resource.id },
    });
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
        >
          {resources.map(resource => (
            <Marker
              key={resource.id}
              coordinate={{
                latitude: resource.location.latitude,
                longitude: resource.location.longitude,
              }}
              onPress={() => handleMarkerPress(resource)}
            >
              <Image
                source={categoryImages[resource.category] || categoryImages['other']}
                style={{ width: 30, height: 30 }}
              />
            </Marker>
          ))}
        </MapView>
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
