import Constants from 'expo-constants';
import { isDevelopment } from '@/utils/env';

// Define the keys we expect to have in our environment
type EnvKey = 'googleMapsApiKey' | 'chatApiEndpoint' | 'defaultChatLocation' | 'buildDate' | 'gitSha';

/**
 * For debugging: Dump values from Constants.expoConfig.extra to help diagnose issues
 */
function dumpConfigValues() {
  console.log('Constants.expoConfig:', Constants.expoConfig);
  console.log('Constants.expoConfig?.extra:', Constants.expoConfig?.extra);

  if (Constants.expoConfig?.extra) {
    const { extra } = Constants.expoConfig;
    Object.keys(extra).forEach(key => {
      const value = extra[key];
      const displayValue = typeof value === 'string' && key.includes('Key')
        ? `${value.substring(0, 4)}...`
        : value;
      console.log(`- ${key}: ${displayValue}`);
    });
  } else {
    console.log('No extra config values found!');
  }
}

/**
 * Get environment variable from Constants.expoConfig - fails fast if value is missing
 */
const getEnvVariable = (key: EnvKey): string => {
  // Check if we have a config error
  if (Constants.expoConfig?.extra?.envError) {
    const errorMsg = `Environment error: ${Constants.expoConfig.extra.error}`;
    console.error(errorMsg);

    // Debug info
    dumpConfigValues();

    throw new Error(errorMsg);
  }

  // Try Constants.expoConfig?.extra
  const configValue = Constants.expoConfig?.extra?.[key];

  // Log all values in development to help debug
  if (isDevelopment && !configValue) {
    console.error(`\n\x1b[43m\x1b[30m ENV DEBUG \x1b[0m Missing value for key: ${key}`);
    dumpConfigValues();
  }

  // Check if the value exists and is valid
  if (configValue &&
      typeof configValue === 'string' &&
      !configValue.includes('_PLACEHOLDER') &&
      configValue !== key.toUpperCase()) {
    return configValue;
  }

  // Throw a clear error - no fallbacks
  const errorMessage = `Environment variable "${key}" is missing or invalid!`;
  console.error(
    `\n\x1b[41m\x1b[37m ENVIRONMENT ERROR \x1b[0m\n` +
    `\x1b[31m${errorMessage}\x1b[0m\n` +
    `Make sure all required environment variables are defined in .env.local`
  );
  throw new Error(errorMessage);
};

// Retrieve remaining environment variables - will throw if missing
export const CHAT_API_ENDPOINT = getEnvVariable('chatApiEndpoint');
export const DEFAULT_CHAT_LOCATION = getEnvVariable('defaultChatLocation');
export const GOOGLE_MAPS_API_KEY = getEnvVariable('googleMapsApiKey');

// Build metadata - these will also throw if missing
export const BUILD_DATE = getEnvVariable('buildDate');
export const GIT_SHA = getEnvVariable('gitSha');
