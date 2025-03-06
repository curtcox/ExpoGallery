import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Button } from 'react-native';
import MapView, { Marker } from '@/components/FixedMap';
import * as Location from 'expo-location';
import { info, error, oneButtonAlert } from '@/utils/index';
import { router, useLocalSearchParams } from 'expo-router';
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
  const [followsUserLocation, setFollowsUserLocation] = useState(true);
  const { resourceId, lat, lng } = useLocalSearchParams<{
    resourceId?: string;
    lat?: string;
    lng?: string;
  }>();

  function loadResourceData() {
    setResources(getAllResources());
  }

  async function requestLocationAndSetInitialRegion() {
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
  }

  function centerMapOnRegion() {
    if (mapLoaded && region && mapRef.current) {
      mapRef.current.animateToRegion(region, 1000);
    }
  }

  function focusOnSpecificResource() {
    if (mapLoaded && mapRef.current && lat && lng) {
      const latitude = parseFloat(lat);
      const longitude = parseFloat(lng);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        setFollowsUserLocation(false);

        const resourceRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(resourceRegion);
        mapRef.current.animateToRegion(resourceRegion, 1000);

        if (resourceId) {
          info(`Focusing on resource: ${resourceId}`);
        }
      }
    }
  }

  const focusMapOnUserLocation = async () => {
    try {
      setFollowsUserLocation(true);

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

  useEffect(() => { loadResourceData(); }, []);
  useEffect(() => { requestLocationAndSetInitialRegion(); }, []);
  useEffect(() => { centerMapOnRegion(); }, [mapLoaded, region]);
  useEffect(() => { focusOnSpecificResource(); }, [mapLoaded, lat, lng, resourceId]);

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          followsUserLocation={followsUserLocation}
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
