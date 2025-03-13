/**
 * Location services for handling geospatial data on web platforms
 * Web-specific implementation using navigator.geolocation
 * This file maintains the same structure as location.tsx
 */
import deviceLocationService from './deviceLocation.web';

/**
 * Converts a latitude and longitude to a geohash string
 * @param latitude - Latitude in decimal degrees
 * @param longitude - Longitude in decimal degrees
 * @returns Geohash string (always 10 characters)
 */
export function latLongToGeohash(
  latitude: number,
  longitude: number
): string {
  // Validate inputs
  if (latitude < -90 || latitude > 90) {
    throw new Error('Latitude must be between -90 and 90');
  }
  if (longitude < -180 || longitude > 180) {
    throw new Error('Longitude must be between -180 and 180');
  }

  const precision = 10; // Always use 10 character geohashes
  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let geohash = '';

  // Set up the bounds for latitude and longitude
  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;

  let bit = 0;
  let idx = 0;

  // Iterate until we reach the desired precision
  while (geohash.length < precision) {
    if (bit % 2 === 0) {
      // Longitude (even bits)
      const lonMid = (lonMin + lonMax) / 2;
      if (longitude >= lonMid) {
        idx = idx * 2 + 1;
        lonMin = lonMid;
      } else {
        idx = idx * 2;
        lonMax = lonMid;
      }
    } else {
      // Latitude (odd bits)
      const latMid = (latMin + latMax) / 2;
      if (latitude >= latMid) {
        idx = idx * 2 + 1;
        latMin = latMid;
      } else {
        idx = idx * 2;
        latMax = latMid;
      }
    }

    bit += 1;

    // When we've collected 5 bits, convert to a base32 character
    if (bit % 5 === 0) {
      geohash += base32.charAt(idx);
      idx = 0;
    }
  }

  return geohash;
}

/**
 * Converts a geohash string to latitude and longitude
 * @param geohash - Geohash string
 * @returns Object containing latitude, longitude, and error margins
 */
export function geohashToLatLong(geohash: string): {
  latitude: number;
  longitude: number;
  latitudeError: number;
  longitudeError: number;
} {
  if (!geohash || typeof geohash !== 'string' || geohash.length !== 10) {
    throw new Error('Geohash must be a non-empty string of exactly 10 characters');
  }

  const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';

  // Set up the bounds for latitude and longitude
  let latMin = -90;
  let latMax = 90;
  let lonMin = -180;
  let lonMax = 180;

  let isEven = true;

  // Process each character in the geohash
  for (let i = 0; i < geohash.length; i++) {
    const char = geohash[i].toLowerCase();
    const charIndex = base32.indexOf(char);

    if (charIndex === -1) {
      throw new Error(`Invalid geohash character: ${char}`);
    }

    // Process each bit in the 5-bit character
    for (let j = 4; j >= 0; j--) {
      const bitValue = (charIndex >> j) & 1;

      if (isEven) {
        // Longitude (even bits)
        const lonMid = (lonMin + lonMax) / 2;
        if (bitValue === 1) {
          lonMin = lonMid;
        } else {
          lonMax = lonMid;
        }
      } else {
        // Latitude (odd bits)
        const latMid = (latMin + latMax) / 2;
        if (bitValue === 1) {
          latMin = latMid;
        } else {
          latMax = latMid;
        }
      }

      isEven = !isEven;
    }
  }

  // Calculate the center point and error margins
  const latitude = (latMin + latMax) / 2;
  const longitude = (lonMin + lonMax) / 2;
  const latitudeError = latMax - latitude;
  const longitudeError = lonMax - longitude;

  return {
    latitude,
    longitude,
    latitudeError,
    longitudeError,
  };
}

/**
 * Calculates the distance between two points on Earth using the Haversine formula
 * @param p1 - First point with latitude and longitude
 * @param p2 - Second point with latitude and longitude
 * @returns Distance in meters
 */
export function calculateDistance(
  p1: {latitude: number, longitude: number},
  p2: {latitude: number, longitude: number}
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = p1.latitude * Math.PI/180;
  const φ2 = p2.latitude * Math.PI/180;
  const Δφ = (p2.latitude - p1.latitude) * Math.PI/180;
  const Δλ = (p2.longitude - p1.longitude) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}

// Bind the methods to maintain their 'this' context
export const requestForegroundPermissionsAsync = deviceLocationService.requestForegroundPermissionsAsync.bind(deviceLocationService);
export const initLocationWatching = deviceLocationService.initLocationWatching.bind(deviceLocationService);
export const getCurrentLocation = deviceLocationService.getCurrentLocation.bind(deviceLocationService);
export const stopLocationWatching = deviceLocationService.stopLocationWatching.bind(deviceLocationService);