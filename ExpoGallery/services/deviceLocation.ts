/**
 * Interface for platform-specific location services
 * This file defines the common API that platform-specific implementations must provide
 */

// Type definitions shared between platforms
export interface LocationObject {
  coords: {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

export interface LocationSubscription {
  remove: () => void;
}

export enum Accuracy {
  Lowest = 1,
  Low = 2,
  Balanced = 3,
  High = 4,
  Highest = 5,
  BestForNavigation = 6,
}

// Interface for the platform-specific location services
export interface DeviceLocationService {
  /**
   * Request permission to access the device's location
   */
  requestForegroundPermissionsAsync(): Promise<{ status: string }>;

  /**
   * Initialize location watching in the background
   */
  initLocationWatching(): Promise<void>;

  /**
   * Get the current device location
   */
  getCurrentLocation(): Promise<LocationObject | null>;

  /**
   * Stop watching for location updates
   */
  stopLocationWatching(): void;
}