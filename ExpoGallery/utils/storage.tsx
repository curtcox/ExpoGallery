import AsyncStorage from '@react-native-async-storage/async-storage';
import { info, error } from '../utils/logger';

export const save = async (key: string, value: string, setLastOperation: Function) => {
  try {
    await AsyncStorage.setItem(key, value);
    setLastOperation({ key, value, type: 'saved' });
    info(`Saved ${value} for ${key}`);
  } catch (e) {
    error('Error saving value for key: ' + key, e);
  }
};

export const getValueFor = async (key: string, setLastOperation: Function, onChangeKey: Function, onChangeValue: Function) => {
    try {
    const value = await AsyncStorage.getItem(key);
    info(`${value} retrieved for ${key}`);
    setLastOperation({ key, value, type: 'loaded' });
    onChangeKey(key);
    onChangeValue(value);
    return value;
  } catch (e) {
    error('Error getting value for key: ' + key, e);
  }
};

export const getAllKeys = async (setStorageKeys: Function) => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    setStorageKeys(keys);
    info('Retrieved all storage keys');
  } catch (e) {
    error('Error getting all keys', e);
  }
};
