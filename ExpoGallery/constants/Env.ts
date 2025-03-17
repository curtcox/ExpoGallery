import Constants from 'expo-constants';

/**
 * Get environment variable from Constants.expoConfig or process.env with fallback
 */
const getEnvVariable = (
  key: string,
  placeholder: string,
  fallback: string = '',
  envPrefix: string = 'EXPO_PUBLIC_'
): string => {
  // Try Constants.expoConfig?.extra
  const configValue = Constants.expoConfig?.extra?.[key];
  if (configValue && configValue !== placeholder) {
    return configValue;
  }

  // Try process.env
  const envKey = `${envPrefix}${key}`;
  if (process.env[envKey]) {
    return process.env[envKey] as string;
  }

  // Fallback with warning
  console.warn(`${key} not found in environment variables or app.json`);
  return fallback;
};

// Retrieve environment variables (ensures build-time injection for web)
export const GOOGLE_MAPS_API_KEY = getEnvVariable(
  'googleMapsApiKey',
  'GOOGLE_MAPS_API_KEY_PLACEHOLDER',
  ''
);

// Chat API endpoint from environment
export const CHAT_API_ENDPOINT = getEnvVariable(
  'chatApiEndpoint',
  'CHAT_API_ENDPOINT_PLACEHOLDER',
  'http://54.147.61.224:5000/chat'
);

// Default geohash location for chat service
export const DEFAULT_CHAT_LOCATION = getEnvVariable(
  'defaultChatLocation',
  'DEFAULT_CHAT_LOCATION_PLACEHOLDER',
  '9yzey5mxsb'
);

// Add other environment variables as needed