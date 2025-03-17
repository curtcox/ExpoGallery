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

// Chat API endpoint from environment
export const CHAT_API_ENDPOINT = (() => {
  // For development/production with expo-constants
  const configValue = Constants.expoConfig?.extra?.chatApiEndpoint;
  if (configValue && configValue !== 'CHAT_API_ENDPOINT_PLACEHOLDER') {
    return configValue;
  }

  // For local development with process.env
  if (process.env.EXPO_PUBLIC_CHAT_API_ENDPOINT) {
    return process.env.EXPO_PUBLIC_CHAT_API_ENDPOINT;
  }

  console.warn('Chat API Endpoint not found in environment variables or app.json');
  return 'http://54.147.61.224:5000/chat'; // Fallback to the default value
})();

// Default geohash location for chat service
export const DEFAULT_CHAT_LOCATION = (() => {
  // For development/production with expo-constants
  const configValue = Constants.expoConfig?.extra?.defaultChatLocation;
  if (configValue && configValue !== 'DEFAULT_CHAT_LOCATION_PLACEHOLDER') {
    return configValue;
  }

  // For local development with process.env
  if (process.env.EXPO_PUBLIC_DEFAULT_CHAT_LOCATION) {
    return process.env.EXPO_PUBLIC_DEFAULT_CHAT_LOCATION;
  }

  console.warn('Default Chat Location not found in environment variables or app.json');
  return '9yzey5mxsb'; // Fallback to the default value
})();

// Add other environment variables as needed