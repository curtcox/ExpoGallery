/**
 * Jest setup file to provide mocks for native modules
 *
 * Note: Individual tests can still override these mocks as needed
 */

// Create mock implementations with proper Jest functionality
const mockAsyncStorage = {
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve()),
};

// Create mock logger that won't output to console during tests
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
};

// Mock AsyncStorage globally
jest.mock('@react-native-async-storage/async-storage', () => mockAsyncStorage);

// Mock logger to prevent console output during tests
jest.mock('@/utils/logger', () => mockLogger);

// Add global test setup and teardown
beforeEach(() => {
  // Clear all mock implementations between tests
  jest.clearAllMocks();
});

// Add any other mocks or setup as needed

/**
 * Global Jest setup file
 * This file is executed before each test file
 */

// Import required test utilities
import '@testing-library/jest-dom';

// Mock Expo modules
const mockExpoConstants = {
  expoConfig: {
    extra: {
      chatApiEndpoint: 'https://api.example.com/chat',
      defaultChatLocation: 'dqcjqcp0',
      googleMapsApiKey: 'test_google_maps_api_key',
      buildDate: '2023-10-10',
      gitSha: 'abcdef1234567890'
    }
  }
};

Object.defineProperty(global, 'expo-constants', {
  value: mockExpoConstants,
  writable: false
});

jest.mock('expo-constants', () => mockExpoConstants);

jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'test-brand',
  manufacturer: 'test-manufacturer',
  modelName: 'test-model',
  deviceName: 'test-device',
  deviceYearClass: 2023,
  totalMemory: 8000,
  supportedCpuArchitectures: ['arm64'],
  osName: 'iOS',
  osVersion: '16.0',
  osBuildId: 'test-build',
  osInternalBuildId: 'test-internal-build',
  deviceId: 'test-device-id',
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 0,
      accuracy: 5,
      altitudeAccuracy: 5,
      heading: 0,
      speed: 0
    },
    timestamp: 1234567890
  }),
  LocationAccuracy: {
    Balanced: 3,
    High: 4,
    Highest: 5,
    Low: 2,
    Lowest: 1
  }
}));

// Mock EventEmitter
jest.mock('expo-modules-core', () => ({
  EventEmitter: class {
    constructor() {}
    addListener() { return { remove: () => {} }; }
    removeAllListeners() {}
    emit() {}
  }
}));

// Mock react-native-web modules
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: jest.fn((obj) => obj.web),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock react-native-maps
jest.mock('react-native-maps', () => ({
  __esModule: true,
  default: () => null,
  Marker: () => null,
  Callout: () => null,
}));

// Skip console.error output in environment tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (args[0]?.includes?.('Unable to install Expo modules')) {
    return;
  }
  originalConsoleError(...args);
};

// Add any global test setup here
import '@testing-library/jest-dom';

// Mock any global objects that might be needed for tests
global.fetch = jest.fn();

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});