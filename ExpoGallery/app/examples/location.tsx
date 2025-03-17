import { useState } from 'react';
import { Platform, Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

export default function Example() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<Location.LocationAccuracy>(Location.LocationAccuracy.Balanced);
  const [isTracking, setIsTracking] = useState(false);

  const accuracyOptions = [
    { value: Location.LocationAccuracy.Lowest, label: 'Lowest', description: 'Accurate to the nearest three kilometers' },
    { value: Location.LocationAccuracy.Low, label: 'Low', description: 'Accurate to the nearest kilometer' },
    { value: Location.LocationAccuracy.Balanced, label: 'Balanced (Default)', description: 'Accurate to within one hundred meters' },
    { value: Location.LocationAccuracy.High, label: 'High', description: 'Accurate to within ten meters' },
    { value: Location.LocationAccuracy.Highest, label: 'Highest', description: 'The best level of accuracy available' },
    { value: Location.LocationAccuracy.BestForNavigation, label: 'Best For Navigation', description: 'Highest accuracy with additional sensor data for navigation' },
  ];

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android' && !Device.isDevice) {
      setErrorMsg('Oops, this will not work on Snack in an Android Emulator. Try it on your device!');
      return false;
    }

    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      return false;
    }

    return true;
  };

  const getCurrentLocation = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) return;

    setIsTracking(true);
    try {
      const locationOptions: Location.LocationOptions = {
        accuracy: accuracy
      };

      let location = await Location.getCurrentPositionAsync(locationOptions);
      setLocation(location);
    } catch (error: any) {
      setErrorMsg(`Error getting location: ${error.message || 'Unknown error'}`);
    } finally {
      setIsTracking(false);
    }
  };

  let text = 'Tap "Get Location" to start';
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location.coords, null, 2);
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Location Accuracy Options</Text>

        <Text style={styles.instructionText}>
          Select an accuracy level below. Higher accuracy may use more battery power.
        </Text>

        <View style={styles.optionsContainer}>
          {accuracyOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                accuracy === option.value && styles.selectedOption
              ]}
              onPress={() => setAccuracy(option.value)}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
              <Text style={styles.optionDescription}>{option.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.getLocationButton}
          onPress={getCurrentLocation}
          disabled={isTracking}
        >
          <Text style={styles.buttonText}>
            {isTracking ? 'Getting Location...' : 'Get Location'}
          </Text>
        </TouchableOpacity>

        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Location Results:</Text>
          <Text style={styles.paragraph}>{text}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  instructionText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionsContainer: {
    width: '100%',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    width: '100%',
  },
  selectedOption: {
    backgroundColor: '#d0e8ff',
    borderWidth: 1,
    borderColor: '#4a90e2',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
  },
  getLocationButton: {
    backgroundColor: '#4a90e2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    width: '100%',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    textAlign: 'left',
  },
});
