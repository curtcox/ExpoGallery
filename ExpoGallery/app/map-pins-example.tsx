import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Button, Image } from 'react-native';
import MapView, { Marker } from '@/components/MapView';
import * as Location from 'expo-location';
import { info, error } from './log-example';
import { oneButtonAlert } from './alert-example';

// Embedded JSON data with resource markers
const resourcesData = {
  "resources": [
    {
      "id": "res-1001",
      "name": "Downtown Shelter",
      "category": "shelter",
      "location": {
        "latitude": 38.6636,
        "longitude": -90.32779,
        "address": "123 Main St, New York, NY"
      },
      "details": "Provides emergency shelter, meals, and hygiene facilities.",
      "contact": {
        "phone": "555-1234",
        "website": "http://downtownshelter.org"
      },
      "hours": "24/7",
      "capacity": 50,
      "languagesSupported": ["en", "es"],
      "averageRating": 4.2
    },
    {
      "id": "res-1002",
      "name": "City Food Bank",
      "category": "food",
      "location": {
        "latitude": 38.66,
        "longitude": -90.326,
        "address": "456 Elm St, New York, NY"
      },
      "details": "Offers food packages and meal services.",
      "contact": {
        "phone": "555-5678",
        "website": "http://cityfoodbank.org"
      },
      "hours": "Mon-Fri 9am-5pm",
      "languagesSupported": ["en"],
      "averageRating": 4.0
    }
  ]
};

// Map of resource categories to specific pin images
const categoryImages: { [key: string]: any } = {
  shelter: require('../assets/images/react-logo.png'),
  food: require('../assets/images/react-logo.png'),
  other: require('../assets/images/react-logo.png'),
};

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

export default function HomeScreen() {
  const [region, setRegion] = useState<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  } | null>(null);
  const mapRef = useRef<any>(null);

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

  const handleMarkerPress = (resource: any) => {
      console.log({resource});
      const details = resource? `
      Name: ${resource.name}
      Category: ${resource.category}
      Details: ${resource.details}
    ` : 'No resource selected';
    oneButtonAlert(details);
  };

  return (
    <View style={styles.container}>
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          showsUserLocation={true}
        >
          {resourcesData.resources.map(resource => (
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
