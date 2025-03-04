import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Linking, Platform } from 'react-native';
import { info, error, oneButtonAlert } from '../utils/index';
import { getResourceById } from '@/services/data';
import { router } from 'expo-router';
import { ThemedScrollView } from '@/components/ThemedScrollView';

export default function Route() {
  const { id } = useLocalSearchParams<{
    id: string;
  }>();

  const resource = getResourceById(id);

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

  const callPhone = () => {
    info('Calling phone number');
    const phoneNumber = resource.contact.phone;
    if (phoneNumber) {
      const phoneUrl = `tel:${phoneNumber.replace(/\D/g, '')}`;
      Linking.openURL(phoneUrl).catch(err => {
        error('An error occurred while trying to call:', err);
        oneButtonAlert('Could not open phone dialer');
      });
    }
  };

  const showOnMap = () => {
    info('Showing resource on map');
    router.push({
      pathname: '/(tabs)/map',
      params: {
        resourceId: resource.id,
        lat: resource.location.latitude,
        lng: resource.location.longitude
      }
    });
  };

  return (
    <ThemedScrollView>
      <Text>Resource: {resource.name}</Text>
      <Text>Category: {resource.category}</Text>
      <Text>Location: {resource.location.address}</Text>
      <TouchableOpacity onPress={openDirections} style={styles.button}>
        <Text style={styles.buttonText}>Get Directions</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={showOnMap} style={styles.button}>
        <Text style={styles.buttonText}>Show on Map</Text>
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

      <TouchableOpacity onPress={callPhone} style={styles.button}>
        <Text style={styles.buttonText}>Call Phone</Text>
      </TouchableOpacity>
    </ThemedScrollView>)
  ;
}

const styles = StyleSheet.create({
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