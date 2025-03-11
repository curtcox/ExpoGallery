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