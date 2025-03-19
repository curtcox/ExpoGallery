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

// Mock expo-constants module
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      // Use environment variables with fallbacks
      chatApiEndpoint: process.env.CHAT_API_ENDPOINT || 'https://api.example.com/chat',
      defaultChatLocation: process.env.DEFAULT_CHAT_LOCATION || 'dqcjqcp0',
      googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'test_google_maps_api_key',
      buildDate: process.env.BUILD_DATE || '2023-10-10',
      gitSha: process.env.GITHUB_SHA || 'abcdef1234567890',
    }
  },
  installationId: 'test-installation-id',
  sessionId: 'test-session-id',
}), { virtual: true });

// Mock expo-device
jest.mock('expo-device', () => ({
  isDevice: true,
  brand: 'Apple',
  manufacturer: 'Apple',
  modelName: 'iPhone 12',
  modelId: 'iPhone12,1',
  deviceYearClass: 2020,
  deviceName: 'Test Device',
  totalMemory: 4000000000,
  supportedCpuArchitectures: ['arm64'],
  osName: 'iOS',
  osVersion: '16.0',
  osBuildId: '20A362',
  osInternalBuildId: '20A362',
  osBuildFingerprint: 'Apple/iOS/16.0',
  platformApiLevel: 16,
  deviceType: 1, // Phone
  isEmulator: false,
}), { virtual: true });

// Mock expo-location
jest.mock('expo-location', () => ({
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 0,
      accuracy: 5,
      altitudeAccuracy: 5,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now(),
  }),
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestBackgroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getBackgroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  hasServicesEnabledAsync: jest.fn().mockResolvedValue(true),
  getLastKnownPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 37.7749,
      longitude: -122.4194,
      altitude: 0,
      accuracy: 5,
      altitudeAccuracy: 5,
      heading: 0,
      speed: 0,
    },
    timestamp: Date.now() - 1000, // 1 second ago
  }),
  watchPositionAsync: jest.fn().mockReturnValue({
    remove: jest.fn(),
  }),
  LocationAccuracy: {
    Balanced: 'balanced',
    BestForNavigation: 'bestForNavigation',
    Best: 'best',
    Highest: 'highest',
    Low: 'low',
    Lowest: 'lowest',
  },
  LocationActivityType: {
    Automotive: 'automotive',
    Fitness: 'fitness',
    Other: 'other',
  },
  LocationGeofencingEventType: {
    Enter: 'enter',
    Exit: 'exit',
  },
  LocationGeofencingRegionState: {
    Inside: 'inside',
    Outside: 'outside',
    Unknown: 'unknown',
  },
}), { virtual: true });

// Mock expo modules that are causing issues
jest.mock('expo-asset', () => ({}), { virtual: true });
jest.mock('expo-file-system', () => ({}), { virtual: true });
jest.mock('expo-modules-core', () => ({
  requireNativeModule: () => ({}),
}), { virtual: true });

// Skip console.error output in environment tests
const originalConsoleError = console.error;
console.error = (...args) => {
  // Filter out known environment error messages in tests
  const message = args.join(' ');
  if (message.includes('ENVIRONMENT ERROR') ||
      message.includes('Environment variable') ||
      message.includes('missing or invalid')) {
    // Skip printing these in test output
    return;
  }
  originalConsoleError(...args);
};