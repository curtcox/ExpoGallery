import { Text, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Linking, Platform } from 'react-native';
import { info, error, oneButtonAlert } from '../utils/index';
import { getResourceById } from '@/services/data';
import { router } from 'expo-router';
import { ThemedScrollView } from '@/components/ThemedScrollView';
import { MaterialIcons } from '@expo/vector-icons';

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
    <View style={styles.container}>
      <ThemedScrollView style={styles.scrollView}>
        <Text style={styles.title}>{resource.name}</Text>
        <Text style={styles.sectionText}>Category: {resource.category}</Text>
        <Text style={styles.sectionText}>Location: {resource.location.address}</Text>
        <Text style={styles.sectionText}>Details: {resource.details}</Text>
        <Text style={styles.sectionText}>Contact: {resource.contact.phone}</Text>
        <Text style={styles.sectionText}>Hours: {resource.hours}</Text>
        <Text style={styles.sectionText}>Languages Supported: {resource.languagesSupported.join(', ')}</Text>
        <Text style={styles.sectionText}>Average Rating: {resource.averageRating}</Text>
      </ThemedScrollView>

      <View style={styles.iconButtonContainer}>
        <TouchableOpacity onPress={openDirections} style={styles.iconButton}>
          <MaterialIcons name="directions" size={24} color="#2196F3" />
          <Text style={styles.iconText}>Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={showOnMap} style={styles.iconButton}>
          <MaterialIcons name="map" size={24} color="#2196F3" />
          <Text style={styles.iconText}>Map</Text>
        </TouchableOpacity>

        {resource.contact.website && (
          <TouchableOpacity onPress={openWebsite} style={styles.iconButton}>
            <MaterialIcons name="language" size={24} color="#2196F3" />
            <Text style={styles.iconText}>Website</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={callPhone} style={styles.iconButton}>
          <MaterialIcons name="phone" size={24} color="#2196F3" />
          <Text style={styles.iconText}>Call</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    sectionText: {
      fontSize: 16,
      marginVertical: 5,
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
    // Styles for the icon buttons at the bottom
    iconButtonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      borderTopWidth: 1,
      borderTopColor: '#e0e0e0',
      backgroundColor: '#f8f8f8',
      paddingVertical: 10,
    },
    iconButton: {
      alignItems: 'center',
      padding: 10,
    },
    iconText: {
      fontSize: 12,
      marginTop: 5,
      color: '#2196F3',
    },
    // Styles for the "no resource" message
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