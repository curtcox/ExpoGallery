import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

// Track network status
let isNetworkConnected = true;

// Subscribe to network status changes
NetInfo.addEventListener(state => {
  isNetworkConnected = state.isConnected === true;
});

/**
 * Returns whether the device is currently connected to the internet
 */
export function getNetworkStatus(): boolean {
  return isNetworkConnected;
}

/**
 * Checks if the device is online
 * More reliable than getNetworkStatus() because it attempts to reach a server
 */
export async function isOnline(): Promise<boolean> {
  try {
    // First check the cached network status
    if (!isNetworkConnected) {
      return false;
    }

    // Then try to fetch a small resource to confirm connectivity
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch('https://www.google.com/generate_204', {
      method: 'HEAD',
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return response.status === 204;
  } catch (e) {
    return false;
  }
}

/**
 * Hook to subscribe to network status changes
 */
export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(isNetworkConnected);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected === true);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
}

/**
 * Hook that checks if the app is running in a web environment
 */
export function useIsWeb() {
  return Platform.OS === 'web';
}