/**
 * Native implementation of device location services using expo-location
 */
import * as Location from 'expo-location';
import { error, warn, info } from '@/utils/index';
import { DeviceLocationService, LocationObject } from './deviceLocation';

// Cache for storing the most recent location from watchPositionAsync
let mostRecentLocation: Location.LocationObject | null = null;
let locationSubscription: Location.LocationSubscription | null = null;

/**
 * Convert Expo's LocationObject to our common LocationObject interface
 */
function convertToLocationObject(location: Location.LocationObject | null): LocationObject | null {
  if (!location) return null;

  return {
    coords: {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      altitude: location.coords.altitude,
      accuracy: location.coords.accuracy || 0, // Convert possible null to 0
      altitudeAccuracy: location.coords.altitudeAccuracy,
      heading: location.coords.heading,
      speed: location.coords.speed,
    },
    timestamp: location.timestamp,
  };
}

/**
 * Native implementation of device location service using expo-location
 */
const deviceLocationService: DeviceLocationService = {
  /**
   * Request permission to access the device's location
   */
  async requestForegroundPermissionsAsync(): Promise<{ status: string }> {
    return await Location.requestForegroundPermissionsAsync();
  },

  /**
   * Initialize location watching in the background
   */
  async initLocationWatching(): Promise<void> {
    // Clean up any existing subscription
    if (locationSubscription) {
      locationSubscription.remove();
    }

    try {
      // Request permission if needed
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        warn('Location permission not granted');
        return;
      } else {
        info('Location permission granted');
      }

      // Start watching position
      locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Lowest,
          timeInterval: 10000,    // Update every 10 seconds
          distanceInterval: 100,  // Or when moved 100 meters
        },
        (location) => {
          info(`Location updated: ${JSON.stringify(location.coords)}`);
          mostRecentLocation = location;
        }
      );

      info('Location watching initialized');
    } catch (e) {
      error('Error setting up location watching:', e);
    }
  },

  /**
   * Gets the most recent device location
   * @returns Most recent LocationObject or null if no location data is available
   */
  async getCurrentLocation(): Promise<LocationObject | null> {
    // If we don't have a location subscription yet, initialize it
    if (!locationSubscription) {
      await this.initLocationWatching();
    }

    // If we still don't have a location, try to get the last known position
    if (!mostRecentLocation) {
      try {
        mostRecentLocation = await Location.getLastKnownPositionAsync({
          requiredAccuracy: 1000, // meters (1 km)
          maxAge: 60 * 60 * 1000, // milliseconds (1 hour)
        });
      } catch (e) {
        error('Error getting last known position:', e);
      }
    }

    // Convert Expo's LocationObject to our common interface
    return convertToLocationObject(mostRecentLocation);
  },

  /**
   * Cleans up the location subscription
   * Should be called when the app is closing or when location watching is no longer needed
   */
  stopLocationWatching(): void {
    if (locationSubscription) {
      locationSubscription.remove();
      locationSubscription = null;
      info('Location watching stopped');
    }
  }
};

export default deviceLocationService;