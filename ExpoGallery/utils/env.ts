import Constants from 'expo-constants';
import * as Device from 'expo-device';

/**
 * Detect if the app is running in a development environment
 */
export const isDevelopment = !Constants.expoConfig || process.env.NODE_ENV === 'development';

/**
 * Detect if the app is running in a web environment
 */
export const isWeb = typeof document !== 'undefined';

/**
 * Detect if the app is running in a native environment
 */
export const isNative = Device.osName !== null && !isWeb;

/**
 * Detect if we have an environment configuration error
 */
export const hasEnvError = Boolean(Constants.expoConfig?.extra?.envError);

/**
 * Returns the appropriate configuration value based on the current environment
 *
 * @param prodValue The value to use in production
 * @param devValue The value to use in development
 * @returns The appropriate value based on the environment
 */
export function envConfig<T>(prodValue: T, devValue: T): T {
  return isDevelopment ? devValue : prodValue;
}

/**
 * Returns true if the app is running in a CI/CD environment
 */
export const isCI = Boolean(process.env.CI);

/**
 * Access process.env variables with no fallbacks - will throw error if missing
 * Note: These are only available at build time, not runtime
 */
export function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  if (!value || value === 'undefined') {
    throw new Error(`Required environment variable ${key} is missing!`);
  }
  return value;
}