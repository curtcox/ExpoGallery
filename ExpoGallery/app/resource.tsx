import { Text, Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import resourcesData from '../assets/json/resources.json';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Linking, Platform } from 'react-native';
import { info, error } from './log-example';
import { oneButtonAlert } from './alert-example';

export default function Route() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const resource = resourcesData.resources.find(r => r.id === id);

  // If no resource is found, display a message
  if (!resource) {
    return (
      <View style={styles.noResourceContainer}>
        <Text style={styles.noResourceText}>No matching resource found</Text>
      </View>
    );
  }

  const openDirections = () => {
    info('Getting directions');
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
      web: 'https://maps.google.com/?q='
    });
    const latLng = `${resource.location.latitude},${resource.location.longitude}`;
    const label = resource.name;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
      web: `${scheme}${latLng}`
    });

    if (url) {
      Linking.openURL(url).catch(err => {
        error('An error occurred while opening directions:', err);
        oneButtonAlert('Could not open directions');
      });
    }
  };

  const openWebsite = () => {
    info('Opening Website');
    const url = resource.contact.website;
    if (url) {
      Linking.openURL(url).catch(err => {
        error('An error occurred while opening website:', err);
        oneButtonAlert('Could not open website');
      });
    }
  };

  return (
    <ParallaxScrollView
    headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    headerImage={
      <Image
        source={require('@/assets/images/partial-react-logo.png')}
        style={styles.reactLogo}
      />
    }>
    <Text>Resource: {resource.name}</Text>
    <Text>Category: {resource.category}</Text>
    <Text>Location: {resource.location.address}</Text>
    <TouchableOpacity onPress={openDirections} style={styles.button}>
      <Text style={styles.buttonText}>Get Directions</Text>
    </TouchableOpacity>
    <Text>Details: {resource.details}</Text>
    <Text>Contact: {resource.contact.phone}</Text>
    <Text>Hours: {resource.hours}</Text>
    <Text>Languages Supported: {resource.languagesSupported.join(', ')}</Text>
    <Text>Average Rating: {resource.averageRating}</Text>

    {resource.contact.website && (
      <TouchableOpacity onPress={openWebsite} style={styles.button}>
        <Text style={styles.buttonText}>Visit Website</Text>
      </TouchableOpacity>
    )}
  </ParallaxScrollView>)
  ;
}

const styles = StyleSheet.create({
    reactLogo: {
      height: 178,
      width: 290,
      bottom: 0,
      left: 0,
      position: 'absolute',
    },
    button: {
      backgroundColor: '#2196F3',
      padding: 10,
      borderRadius: 5,
      marginVertical: 10,
      alignItems: 'center',
    },
    buttonText: {
      color: 'white',
      fontWeight: 'bold',
    },
    // Add new styles for the "no resource" message
    noResourceContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    noResourceText: {
      fontSize: 18,
      textAlign: 'center',
    },
  });