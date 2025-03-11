import AsyncStorage from '@react-native-async-storage/async-storage';
import { info, error } from './logger';
import { Platform } from 'react-native';

export const save = async (
  key: string,
  value: string,
  setLastOperation: (op: { key: string, value: string, type: string }) => void
) => {
  try {
    await AsyncStorage.setItem(key, value);
    setLastOperation({ key, value, type: 'save' });
    info(`Saved ${value} for ${key}`);
  } catch (e) {
    error('Error saving data:', e);
  }
};

export const getValueFor = async (
  key: string,
  setLastOperation: (op: { key: string, value: string, type: string }) => void,
  onChangeKey?: (key: string) => void,
  onChangeValue?: (value: string) => void
) => {
  try {
    const value = await AsyncStorage.getItem(key);
    if (value !== null) {
      setLastOperation({ key, value, type: 'load' });
      if (onChangeKey) onChangeKey(key);
      if (onChangeValue) onChangeValue(value);
    }
  } catch (e) {
    error('Error loading data:', e);
  }
};

export const getAllKeys = async (setStorageKeys: (keys: readonly string[]) => void) => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    setStorageKeys(keys);
    info('Retrieved all storage keys');
  } catch (e) {
    error('Error getting all keys:', e);
  }
};

export const storage = Platform.select({
  web: {
    ...AsyncStorage,
    getItem: async (key: string) => {
      if (typeof window === 'undefined') {
        info('SSR context detected, returning null for storage');
        return null;
      }
      try {
        info(`Attempting to get item from AsyncStorage with key: ${key}`);
        return await AsyncStorage.getItem(key);
      } catch (e) {
        error('Storage access error details:', e);
        if (e instanceof Error &&
            (e.message.includes('Access to storage is not allowed') ||
             e.message.includes('from this context'))) {
          info('Storage access is restricted in this context, using memory fallback');
          return memoryStorageFallback.getItem(key);
        }
        error('Error reading from storage:', e);
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      if (typeof window === 'undefined') {
        info('SSR context detected, skipping storage set');
        return;
      }
      try {
        info(`Attempting to set item in AsyncStorage with key: ${key}`);
        await AsyncStorage.setItem(key, value);
      } catch (e) {
        error('Storage access error details:', e);
        if (e instanceof Error &&
            (e.message.includes('Access to storage is not allowed') ||
             e.message.includes('from this context'))) {
          info('Storage access is restricted in this context, using memory fallback');
          memoryStorageFallback.setItem(key, value);
          return;
        }
        error('Error writing to storage:', e);
      }
    },
    removeItem: async (key: string) => {
      if (typeof window === 'undefined') {
        info('SSR context detected, skipping storage removal');
        return;
      }
      try {
        info(`Attempting to remove item from AsyncStorage with key: ${key}`);
        await AsyncStorage.removeItem(key);
      } catch (e) {
        error('Storage access error details:', e);
        if (e instanceof Error &&
            (e.message.includes('Access to storage is not allowed') ||
             e.message.includes('from this context'))) {
          info('Storage access is restricted in this context, using memory fallback');
          memoryStorageFallback.removeItem(key);
          return;
        }
        error('Error removing from storage:', e);
      }
    },
    multiGet: async (keys: string[]) => {
      if (typeof window === 'undefined') {
        info('SSR context detected, returning empty array for multiGet');
        return [];
      }
      try {
        info(`Attempting to get multiple items from AsyncStorage`);
        return await AsyncStorage.multiGet(keys);
      } catch (e) {
        error('Storage access error details:', e);
        if (e instanceof Error &&
            (e.message.includes('Access to storage is not allowed') ||
             e.message.includes('from this context'))) {
          info('Storage access is restricted in this context, using memory fallback');
          return keys.map(key => [key, memoryStorageFallback.getItem(key)]);
        }
        error('Error reading multiple items from storage:', e);
        return [];
      }
    }
  },
  default: AsyncStorage,
});

const memoryStorageFallback = {
  _storage: new Map<string, string>(),
  getItem: (key: string): string | null => {
    return memoryStorageFallback._storage.get(key) || null;
  },
  setItem: (key: string, value: string): void => {
    memoryStorageFallback._storage.set(key, value);
  },
  removeItem: (key: string): void => {
    memoryStorageFallback._storage.delete(key);
  },
  clear: (): void => {
    memoryStorageFallback._storage.clear();
  }
};
