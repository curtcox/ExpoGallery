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
        return null;
      }
      try {
        return await AsyncStorage.getItem(key);
      } catch (e) {
        error('Error reading from storage:', e);
        return null;
      }
    },
    setItem: async (key: string, value: string) => {
      if (typeof window === 'undefined') {
        return;
      }
      try {
        await AsyncStorage.setItem(key, value);
      } catch (e) {
        error('Error writing to storage:', e);
      }
    }
  },
  default: AsyncStorage,
});
