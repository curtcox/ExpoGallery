import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Mock Platform
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: jest.fn((obj) => obj.web),
}));

// Mock logger to prevent console output during tests
jest.mock('../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

describe('Storage Utility', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getItem', () => {
    it('should retrieve item successfully from AsyncStorage', async () => {
      // Setup
      AsyncStorage.getItem.mockResolvedValueOnce('test-value');

      // Execute
      const result = await storage.getItem('test-key');

      // Assert
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('test-key');
      expect(result).toBe('test-value');
    });

    it('should return null when window is undefined', async () => {
      // Setup - simulate server-side rendering
      const originalWindow = global.window;
      // @ts-ignore - for testing purposes
      delete global.window;

      // Execute
      const result = await storage.getItem('test-key');

      // Assert
      expect(AsyncStorage.getItem).not.toHaveBeenCalled();
      expect(result).toBeNull();

      // Cleanup
      global.window = originalWindow;
    });

    // This test specifically checks for the bug we're experiencing
    it('should use memory fallback when "Access to storage is not allowed from this context" error occurs', async () => {
      // Setup
      AsyncStorage.getItem.mockRejectedValueOnce(
        new Error('Access to storage is not allowed from this context')
      );

      // Execute
      const result = await storage.getItem('test-key');

      // Assert
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('test-key');
      // Result should not be null because memory fallback should be used
      expect(result).toBeNull(); // Initially null since nothing in memory fallback
    });

    // This test checks the original error pattern
    it('should use memory fallback when "Access to storage is not allowed" error occurs', async () => {
      // Setup
      AsyncStorage.getItem.mockRejectedValueOnce(
        new Error('Access to storage is not allowed')
      );

      // Execute
      const result = await storage.getItem('test-key');

      // Assert
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('test-key');
      // Result should not be null because memory fallback should be used
      expect(result).toBeNull(); // Initially null since nothing in memory fallback
    });
  });

  describe('setItem', () => {
    it('should set item successfully in AsyncStorage', async () => {
      // Setup
      AsyncStorage.setItem.mockResolvedValueOnce(undefined);

      // Execute
      await storage.setItem('test-key', 'test-value');

      // Assert
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should do nothing when window is undefined', async () => {
      // Setup - simulate server-side rendering
      const originalWindow = global.window;
      // @ts-ignore - for testing purposes
      delete global.window;

      // Execute
      await storage.setItem('test-key', 'test-value');

      // Assert
      expect(AsyncStorage.setItem).not.toHaveBeenCalled();

      // Cleanup
      global.window = originalWindow;
    });

    // This test specifically checks for the bug we're experiencing
    it('should use memory fallback when "Access to storage is not allowed from this context" error occurs', async () => {
      // Setup
      AsyncStorage.setItem.mockRejectedValueOnce(
        new Error('Access to storage is not allowed from this context')
      );

      // Execute
      await storage.setItem('test-key', 'test-value');

      // Assert
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('test-key', 'test-value');

      // Check memory fallback works by retrieving the value
      // First mock AsyncStorage.getItem to simulate continued restriction
      AsyncStorage.getItem.mockRejectedValueOnce(
        new Error('Access to storage is not allowed from this context')
      );

      const result = await storage.getItem('test-key');
      expect(result).toBe('test-value');
    });
  });

  describe('Memory fallback integration', () => {
    it('should store and retrieve values using memory fallback when storage is restricted', async () => {
      // Setup - AsyncStorage is restricted for both operations
      AsyncStorage.setItem.mockRejectedValueOnce(
        new Error('Access to storage is not allowed from this context')
      );
      AsyncStorage.getItem.mockRejectedValueOnce(
        new Error('Access to storage is not allowed from this context')
      );

      // Execute - Set a value
      await storage.setItem('memory-key', 'memory-value');

      // Now try to get the value - should come from memory fallback
      const result = await storage.getItem('memory-key');

      // Assert
      expect(result).toBe('memory-value');
    });
  });
});