import { calculateDistance, latLongToGeohash, geohashToLatLong } from '../location';

// npx jest --config jest.config.js services/__tests__/location.test.tsx

describe('latLongToGeohash', () => {
  test('should convert valid latitude and longitude to geohash for San Francisco', () => {
    expect(latLongToGeohash(37.7749, -122.4194)).toBe('9q8yyk8ytp');
  });

  test('should convert valid latitude and longitude to geohash for New York', () => {
    expect(latLongToGeohash(40.7128, -74.0060)).toBe('dr5regw3pp');
  });

  test('should convert valid latitude and longitude to geohash for Tokyo', () => {
    expect(latLongToGeohash(35.6762, 139.6503)).toBe('xn76cydhzv');
  });

  test('should convert valid latitude and longitude to geohash for Sydney', () => {
    expect(latLongToGeohash(-33.8688, 151.2093)).toBe('r3gx2f77bn');
  });

  test('should handle North Pole coordinates', () => {
    expect(latLongToGeohash(90, 0)).toBe('upbpbpbpbp');
  });

  test('should handle South Pole coordinates', () => {
    expect(latLongToGeohash(-90, 0)).toBe('h000000000');
  });

  test('should handle Prime Meridian at Equator coordinates', () => {
    expect(latLongToGeohash(0, 0)).toBe('s000000000');
  });

  test('should handle International Date Line at Equator coordinates', () => {
    expect(latLongToGeohash(0, 180)).toBe('xbpbpbpbpb');
  });

  test('should throw error for invalid inputs', () => {
    expect(() => latLongToGeohash(91, 0)).toThrow('Latitude must be between -90 and 90');
    expect(() => latLongToGeohash(-91, 0)).toThrow('Latitude must be between -90 and 90');
    expect(() => latLongToGeohash(0, 181)).toThrow('Longitude must be between -180 and 180');
    expect(() => latLongToGeohash(0, -181)).toThrow('Longitude must be between -180 and 180');
  });
});

describe('geohashToLatLong', () => {
  test('should convert geohash to latitude and longitude for San Francisco', () => {
    const sf = geohashToLatLong('9q8yyk8ytp');
    expect(sf.latitude).toBeCloseTo(37.7749, 2);
    expect(sf.longitude).toBeCloseTo(-122.4194, 2);
  });

  test('should convert geohash to latitude and longitude for New York', () => {
    const ny = geohashToLatLong('dr5regw3pp');
    expect(ny.latitude).toBeCloseTo(40.7128, 2);
    expect(ny.longitude).toBeCloseTo(-74.0060, 2);
  });

  test('should convert geohash to latitude and longitude for Tokyo', () => {
    const tokyo = geohashToLatLong('xn76cydhzv');
    expect(tokyo.latitude).toBeCloseTo(35.6762, 2);
    expect(tokyo.longitude).toBeCloseTo(139.6503, 2);
  });

  test('should convert geohash to latitude and longitude for Sydney', () => {
    const sydney = geohashToLatLong('r3gx2f77bn');
    expect(sydney.latitude).toBeCloseTo(-33.8688, 2);
    expect(sydney.longitude).toBeCloseTo(151.2093, 2);
  });

  test('should handle North Pole coordinates', () => {
    const northPole = geohashToLatLong('upbpbpbpbp');
    expect(northPole.latitude).toBeCloseTo(90, 2);
    expect(northPole.longitude).toBeCloseTo(0, 2);
  });

  test('should provide error margins', () => {
    const result = geohashToLatLong('9q8yyk8ytp');
    expect(result).toHaveProperty('latitudeError');
    expect(result).toHaveProperty('longitudeError');
    expect(result.latitudeError).toBeGreaterThan(0);
    expect(result.longitudeError).toBeGreaterThan(0);
  });

  test('should throw error for invalid inputs', () => {
    expect(() => geohashToLatLong('')).toThrow('Geohash must be a non-empty string of exactly 10 characters');
    expect(() => geohashToLatLong('invalid!!!')).toThrow('Invalid geohash character: i');
    expect(() => geohashToLatLong('h00000000!')).toThrow('Invalid geohash character: !');
  });
});

describe('Round-trip conversion', () => {
  const testLocations = [
    { lat: 37.7749, lon: -122.4194, name: 'San Francisco' },
    { lat: 40.7128, lon: -74.0060, name: 'New York' },
    { lat: 35.6762, lon: 139.6503, name: 'Tokyo' },
    { lat: -33.8688, lon: 151.2093, name: 'Sydney' },
    { lat: 51.5074, lon: -0.1278, name: 'London' },
    { lat: 48.8566, lon: 2.3522, name: 'Paris' },
    { lat: -22.9068, lon: -43.1729, name: 'Rio de Janeiro' },
    { lat: 55.7558, lon: 37.6173, name: 'Moscow' },
    { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
    { lat: 25.2048, lon: 55.2708, name: 'Dubai' }
  ];

  testLocations.forEach(location => {
    test(`should preserve location when converting back and forth for ${location.name}`, () => {
      // Test lat/long -> geohash -> lat/long
      const geohash = latLongToGeohash(location.lat, location.lon);
      const result = geohashToLatLong(geohash);

      expect(result.latitude).toBeCloseTo(location.lat, 5);
      expect(result.longitude).toBeCloseTo(location.lon, 5);

      // Test geohash -> lat/long -> geohash
      const roundTripGeohash = latLongToGeohash(result.latitude, result.longitude);
      expect(roundTripGeohash).toBe(geohash);
    });
  });
});

describe('calculateDistance', () => {
  test('calculates distance between two identical points as 0', () => {
    const point = { latitude: 0, longitude: 0 };
    expect(calculateDistance(point, point)).toBe(0);
  });

  test('calculates distance between San Francisco and New York', () => {
    const sanFrancisco = { latitude: 37.7749, longitude: -122.4194 };
    const newYork = { latitude: 40.7128, longitude: -74.0060 };
    const distance = calculateDistance(sanFrancisco, newYork);
    // Expected distance is approximately 4128 kilometers
    expect(distance).toBeCloseTo(4129086, -3); // Within 1km accuracy
  });

  test('calculates distance between London and Paris', () => {
    const london = { latitude: 51.5074, longitude: -0.1278 };
    const paris = { latitude: 48.8566, longitude: 2.3522 };
    const distance = calculateDistance(london, paris);
    // Expected distance is approximately 344 kilometers
    expect(distance).toBeCloseTo(344000, -3); // Within 1km accuracy
  });

  test('calculates distance across the equator', () => {
    const quito = { latitude: 0.1807, longitude: -78.4678 };
    const singapore = { latitude: 1.3521, longitude: 103.8198 };
    const distance = calculateDistance(quito, singapore);
    // Expected distance is approximately 19,900 kilometers
    expect(distance).toBeCloseTo(19708912, -3); // Within 1km accuracy
  });

  test('handles negative latitudes and longitudes', () => {
    const buenosAires = { latitude: -34.6037, longitude: -58.3816 };
    const capeTown = { latitude: -33.9249, longitude: 18.4241 };
    const distance = calculateDistance(buenosAires, capeTown);
    // Expected distance is approximately 6,400 kilometers
    expect(distance).toBeCloseTo(6869753, -3); // Within 1km accuracy
  });
});