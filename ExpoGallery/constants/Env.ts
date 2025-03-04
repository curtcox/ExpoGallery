import Constants from 'expo-constants';

// Retrieve environment variables (ensures build-time injection for web)
export const GOOGLE_MAPS_API_KEY = (() => {
  // For development/production with expo-constants
  const configValue = Constants.expoConfig?.extra?.googleMapsApiKey;
  if (configValue && configValue !== 'GOOGLE_MAPS_API_KEY_PLACEHOLDER') {
    return configValue;
  }

  // For local development with process.env
  if (process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  }

  console.warn('Google Maps API Key not found in environment variables or app.json');
  return '';
})();

// Add other environment variables as needed