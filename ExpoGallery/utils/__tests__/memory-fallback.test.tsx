import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock logger to prevent console output during tests
jest.mock('../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Memory Storage Fallback', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset modules to ensure clean state for each test
    jest.resetModules();
  });

  it('should use memory fallback when AsyncStorage throws access restriction error', async () => {
    // Mock the platform as web for this test
    jest.mock('react-native/Libraries/Utilities/Platform', () => ({
      OS: 'web',
      select: jest.fn(obj => obj.web)
    }));

    // Mock AsyncStorage to always throw the specific error
    AsyncStorage.getItem.mockRejectedValue(
      new Error('Access to storage is not allowed from this context')
    );
    AsyncStorage.setItem.mockRejectedValue(
      new Error('Access to storage is not allowed from this context')
    );

    // Now import the storage module which will use our mocks
    const { storage } = require('../storage');

    // Test storing and retrieving a value (should use memory fallback)
    await storage.setItem('test-key', 'test-value');
    const result = await storage.getItem('test-key');

    // Verify AsyncStorage was still called (but failed)
    expect(AsyncStorage.setItem).toHaveBeenCalled();
    expect(AsyncStorage.getItem).toHaveBeenCalled();

    // Verify we got our value from memory fallback
    expect(result).toBe('test-value');
  });

  it('should persist values in memory when AsyncStorage is not available', async () => {
    // Mock the platform as web for this test
    jest.mock('react-native/Libraries/Utilities/Platform', () => ({
      OS: 'web',
      select: jest.fn(obj => obj.web)
    }));

    // Mock AsyncStorage to always throw the specific error
    AsyncStorage.getItem.mockRejectedValue(
      new Error('Access to storage is not allowed from this context')
    );
    AsyncStorage.setItem.mockRejectedValue(
      new Error('Access to storage is not allowed from this context')
    );

    // Now import the storage module which will use our mocks
    const { storage } = require('../storage');

    // Store multiple values
    await storage.setItem('key1', 'value1');
    await storage.setItem('key2', 'value2');
    await storage.setItem('key3', 'value3');

    // Retrieve and verify each value
    expect(await storage.getItem('key1')).toBe('value1');
    expect(await storage.getItem('key2')).toBe('value2');
    expect(await storage.getItem('key3')).toBe('value3');

    // Update a value
    await storage.setItem('key2', 'updated-value');
    expect(await storage.getItem('key2')).toBe('updated-value');
  });

  it('should handle removing items from memory fallback', async () => {
    // This test requires the memory fallback to have a removeItem implementation

    // Mock the platform as web for this test
    jest.mock('react-native/Libraries/Utilities/Platform', () => ({
      OS: 'web',
      select: jest.fn(obj => obj.web)
    }));

    // Mock AsyncStorage to always throw the specific error
    AsyncStorage.getItem.mockRejectedValue(
      new Error('Access to storage is not allowed from this context')
    );
    AsyncStorage.setItem.mockRejectedValue(
      new Error('Access to storage is not allowed from this context')
    );

    // Now import the storage module which will use our mocks
    const { storage } = require('../storage');

    // Store a value
    await storage.setItem('temp-key', 'temp-value');
    expect(await storage.getItem('temp-key')).toBe('temp-value');

    // Remove the value if removeItem is implemented
    if (typeof storage.removeItem === 'function') {
      await storage.removeItem('temp-key');
      expect(await storage.getItem('temp-key')).toBeNull();
    }
  });
});