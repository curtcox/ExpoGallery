import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import MapView, { Marker } from '@/components/MapView';
import * as Location from 'expo-location';
import { info, error, oneButtonAlert } from '@/utils/index';
import { router } from 'expo-router';
import { getAllResources, Resource } from '@/services/data';
import { MaterialIcons } from '@expo/vector-icons';

// Map of resource categories to specific pin images
const iconFor = (category: string): keyof typeof MaterialIcons.glyphMap => {
  switch (category) {
    case 'shelter':    return 'night-shelter';
    case 'food':       return 'soup-kitchen';
    case 'employment': return 'person-search';
    default:           return 'circle';
  }
};

function materialIcon(name: keyof typeof MaterialIcons.glyphMap) {
  return (
      <MaterialIcons name={name} size={24} color="black" />
  );
}

export default function MapScreen() {
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const mapRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [resources, setResources] = useState<Resource[]>([]);

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

  const focusMapOnUserLocation = async () => {
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
    info(JSON.stringify(resource));
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
              {materialIcon(iconFor(resource.category))}
            </Marker>
          ))}
        </MapView>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Center Map" onPress={focusMapOnUserLocation} />
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
