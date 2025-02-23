import { ThemedText } from '@/components/ThemedText';

export default function HomeScreen() {
  return (
      <ThemedText type="title">Map Pin Example</ThemedText>
  );
}

// import React, { useState, useEffect, useRef } from 'react';
// import { StyleSheet, View, Button, Alert, Image } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import * as Location from 'expo-location';

// // Embedded JSON data with resource markers
// const resourcesData = {
//   "resources": [
//     {
//       "id": "res-1001",
//       "name": "Downtown Shelter",
//       "category": "shelter",
//       "location": {
//         "latitude": 38.6636,
//         "longitude": -90.32779,
//         "address": "123 Main St, New York, NY"
//       },
//       "details": "Provides emergency shelter, meals, and hygiene facilities.",
//       "contact": {
//         "phone": "555-1234",
//         "website": "http://downtownshelter.org"
//       },
//       "hours": "24/7",
//       "capacity": 50,
//       "languagesSupported": ["en", "es"],
//       "averageRating": 4.2
//     },
//     {
//       "id": "res-1002",
//       "name": "City Food Bank",
//       "category": "food",
//       "location": {
//         "latitude": 38.66,
//         "longitude": -90.326,
//         "address": "456 Elm St, New York, NY"
//       },
//       "details": "Offers food packages and meal services.",
//       "contact": {
//         "phone": "555-5678",
//         "website": "http://cityfoodbank.org"
//       },
//       "hours": "Mon-Fri 9am-5pm",
//       "languagesSupported": ["en"],
//       "averageRating": 4.0
//     }
//   ]
// };

// const asset = (path: string) => `../assets/images/${path}.png`;

// // Map of resource categories to specific pin images
// const categoryImages = {
//   shelter: require(asset('icon')),
//   food:    require(asset('icon')),
// };

// export default function App() {
//   const [region, setRegion] = useState(null);
//   const mapRef = useRef(null);

//   // Request permission and fetch the device's current location
//   useEffect(() => {
//     (async () => {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== 'granted') {
//         Alert.alert('Permission Denied', 'Permission to access location was denied');
//         return;
//       }
//       const location = await Location.getCurrentPositionAsync({});
//       const { latitude, longitude } = location.coords;
//       setRegion({
//         latitude,
//         longitude,
//         latitudeDelta: 0.01,
//         longitudeDelta: 0.01,
//       });
//     })();
//   }, []);

//   // Function to recenter the map on the device's current location
//   const centerMap = () => {
//     if (region && mapRef.current) {
//       mapRef.current.animateToRegion(region, 1000);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {region && (
//         <MapView
//           ref={mapRef}
//           style={styles.map}
//           region={region}
//           showsUserLocation={true}
//         >
//           {resourcesData.resources.map(resource => (
//             <Marker
//               key={resource.id}
//               coordinate={{
//                 latitude: resource.location.latitude,
//                 longitude: resource.location.longitude,
//               }}
//               title={resource.name}
//               description={resource.details}
//             >
//               <Image
//                 // Use a specific image for the resource category if available; otherwise, use a default pin image
//                 source={categoryImages[resource.category] || require(asset('icon'))}
//                 style={{ width: 30, height: 30 }}
//               />
//             </Marker>
//           ))}
//         </MapView>
//       )}
//       <View style={styles.buttonContainer}>
//         <Button title="Center Map" onPress={centerMap} />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
//   buttonContainer: {
//     position: 'absolute',
//     bottom: 20,
//     left: 20,
//   },
// });
