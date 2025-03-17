import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { storage } from '../storage';

// Mock AsyncStorage with proper typing for Jest mocks
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

// Cast the mocked functions to Jest Mock types
const mockedGetItem = AsyncStorage.getItem as jest.Mock;
const mockedSetItem = AsyncStorage.setItem as jest.Mock;

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
      mockedGetItem.mockResolvedValueOnce('test-value');

      // Execute
      const result = await storage.getItem('test-key');

      // Assert
      expect(mockedGetItem).toHaveBeenCalledWith('test-key');
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
      expect(mockedGetItem).not.toHaveBeenCalled();
      expect(result).toBeNull();

      // Cleanup
      global.window = originalWindow;
    });
  });

  describe('setItem', () => {
    it('should set item successfully in AsyncStorage', async () => {
      // Setup
      mockedSetItem.mockResolvedValueOnce(undefined);

      // Execute
      await storage.setItem('test-key', 'test-value');

      // Assert
      expect(mockedSetItem).toHaveBeenCalledWith('test-key', 'test-value');
    });

    it('should do nothing when window is undefined', async () => {
      // Setup - simulate server-side rendering
      const originalWindow = global.window;
      // @ts-ignore - for testing purposes
      delete global.window;

      // Execute
      await storage.setItem('test-key', 'test-value');

      // Assert
      expect(mockedSetItem).not.toHaveBeenCalled();

      // Cleanup
      global.window = originalWindow;
    });

  });
});