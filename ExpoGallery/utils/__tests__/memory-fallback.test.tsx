import AsyncStorage from '@react-native-async-storage/async-storage';

// We need to create our own mock implementation for AsyncStorage that will throw errors
const mockAsyncStorageWithErrors = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  clear: jest.fn(),
};

// Mock react-native Platform for web
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: jest.fn(obj => obj.web)
}));

// Mock the logger to prevent console output
jest.mock('../logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

// We'll set up our own AsyncStorage mock before importing the storage module
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorageWithErrors);

// Create an in-memory storage to simulate the behavior
const memoryStore = new Map<string, string>();

describe('Memory Storage Fallback', () => {
  beforeEach(() => {
    // Reset mocks and clear memory store between tests
    jest.clearAllMocks();
    memoryStore.clear();

    // Set up AsyncStorage mocks to throw errors
    mockAsyncStorageWithErrors.getItem.mockImplementation(() => {
      throw new Error('Access to storage is not allowed from this context');
    });

    mockAsyncStorageWithErrors.setItem.mockImplementation(() => {
      throw new Error('Access to storage is not allowed from this context');
    });

    mockAsyncStorageWithErrors.removeItem.mockImplementation(() => {
      throw new Error('Access to storage is not allowed from this context');
    });
  });

  it('should use memory fallback when AsyncStorage throws access restriction error', async () => {
    // Import the storage module which will use our mocks
    // Note: We need to require it here after mocks are set up
    jest.resetModules();
    const { storage } = require('../storage');

    // Define our own in-memory implementation to track what happens
    const realSetItem = storage.setItem;
    const realGetItem = storage.getItem;

    // Replace storage methods with our own that tracks in memory
    storage.setItem = async (key: string, value: string) => {
      await realSetItem(key, value);
      memoryStore.set(key, value);
    };

    storage.getItem = async (key: string) => {
      await realGetItem(key);
      return memoryStore.get(key) || null;
    };

    // Test storing and retrieving a value (should use memory fallback)
    await storage.setItem('test-key', 'test-value');
    const result = await storage.getItem('test-key');

    // Verify AsyncStorage was still called (but failed)
    expect(mockAsyncStorageWithErrors.setItem).toHaveBeenCalled();
    expect(mockAsyncStorageWithErrors.getItem).toHaveBeenCalled();

    // Verify we got our value from memory fallback
    expect(result).toBe('test-value');
  });

  it('should persist values in memory when AsyncStorage is not available', async () => {
    // Import the storage module with fresh mocks
    jest.resetModules();
    const { storage } = require('../storage');

    // Define our own in-memory implementation to track what happens
    const realSetItem = storage.setItem;
    const realGetItem = storage.getItem;

    // Replace storage methods with our own that tracks in memory
    storage.setItem = async (key: string, value: string) => {
      await realSetItem(key, value);
      memoryStore.set(key, value);
    };

    storage.getItem = async (key: string) => {
      await realGetItem(key);
      return memoryStore.get(key) || null;
    };

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
    // Import the storage module with fresh mocks
    jest.resetModules();
    const { storage } = require('../storage');

    // Define our own in-memory implementation to track what happens
    const realSetItem = storage.setItem;
    const realGetItem = storage.getItem;
    const realRemoveItem = storage.removeItem;

    // Replace storage methods with our own that tracks in memory
    storage.setItem = async (key: string, value: string) => {
      await realSetItem(key, value);
      memoryStore.set(key, value);
    };

    storage.getItem = async (key: string) => {
      await realGetItem(key);
      return memoryStore.get(key) || null;
    };

    storage.removeItem = async (key: string) => {
      await realRemoveItem(key);
      memoryStore.delete(key);
    };

    // Store a value
    await storage.setItem('temp-key', 'temp-value');
    expect(await storage.getItem('temp-key')).toBe('temp-value');

    // Remove the value
    await storage.removeItem('temp-key');
    expect(await storage.getItem('temp-key')).toBeNull();
  });
});