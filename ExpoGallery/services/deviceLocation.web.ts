/**
 * Web implementation of device location services using navigator.geolocation
 */
import { error, warn, info } from '@/utils/index';
import { DeviceLocationService, LocationObject } from './deviceLocation';

// Cache for storing the most recent location
let mostRecentLocation: LocationObject | null = null;
let watchId: number | null = null;

/**
 * Geolocation API options for position watching and retrieval
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition
 */
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 60 * 60 * 1000, // 1 hour
  timeout: 60 * 1000 // 1 minute
};

/**
 * Check if geolocation is available in this browser
 * @returns boolean indicating if geolocation is supported
 */
function isGeolocationAvailable(): boolean {
  return typeof navigator !== 'undefined' && 'geolocation' in navigator;
}

/**
 * Converts browser's Position object to our LocationObject interface
 * @param position - Browser Position object
 * @returns LocationObject compatible with our interface
 */
function convertPositionToLocationObject(position: GeolocationPosition): LocationObject {
  return {
    coords: {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude,
      accuracy: position.coords.accuracy,
      altitudeAccuracy: position.coords.altitudeAccuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
    },
    timestamp: position.timestamp,
  };
}

/**
 * Web implementation of device location service using navigator.geolocation
 */
const deviceLocationService: DeviceLocationService = {
  /**
   * Request permission to access the device's location
   * In the web browser, permission is requested when geolocation is first accessed
   */
  async requestForegroundPermissionsAsync(): Promise<{ status: string }> {
    if (!isGeolocationAvailable()) {
      return { status: 'denied' };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        () => resolve({ status: 'granted' }),
        () => resolve({ status: 'denied' }),
        { timeout: 5000 }
      );
    });
  },

  /**
   * Initializes location watching in the background
   */
  async initLocationWatching(): Promise<void> {
    // Clean up any existing watching
    if (watchId !== null) {
      this.stopLocationWatching();
    }

    if (!isGeolocationAvailable()) {
      warn('Geolocation is not available in this browser');
      return;
    }

    try {
      // Checks if permission is granted by trying to get the current position
      navigator.geolocation.getCurrentPosition(
        () => {
          info('Geolocation permission granted');

          // Start watching position
          watchId = navigator.geolocation.watchPosition(
            (position) => {
              const locationObj = convertPositionToLocationObject(position);
              info(`Location updated: ${JSON.stringify(locationObj.coords)}`);
              mostRecentLocation = locationObj;
            },
            (err) => {
              error('Error watching position:', err);
            },
            GEOLOCATION_OPTIONS
          );

          info('Location watching initialized');
        },
        (err) => {
          warn(`Geolocation permission denied or error: ${err.message}`, err);
        }
      );
    } catch (e) {
      error('Error setting up location watching:', e);
    }
  },

  /**
   * Gets the most recent device location
   * @returns Promise resolving to LocationObject or null if no location data is available
   */
  async getCurrentLocation(): Promise<LocationObject | null> {
    if (!isGeolocationAvailable()) {
      warn('Geolocation is not available in this browser');
      return null;
    }

    // If we don't have a location subscription yet, initialize it
    if (watchId === null) {
      await this.initLocationWatching();
    }

    // If we have a cached location, return it immediately
    if (mostRecentLocation) {
      return mostRecentLocation;
    }

    // Otherwise, try to get a fresh location
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationObj = convertPositionToLocationObject(position);
          mostRecentLocation = locationObj;
          resolve(locationObj);
        },
        (err) => {
          error('Error getting current position:', err);
          resolve(null);
        },
        GEOLOCATION_OPTIONS
      );
    });
  },

  /**
   * Gets the last known location without blocking or initializing watching
   * @returns The most recent LocationObject or null if no location has been cached
   */
  getLastKnownLocation(): LocationObject | null {
    return mostRecentLocation;
  },

  /**
   * Cleans up the location subscription
   * Should be called when the app is closing or when location watching is no longer needed
   */
  stopLocationWatching(): void {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
      info('Location watching stopped');
    }
  }
};

export default deviceLocationService;