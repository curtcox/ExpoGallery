import { jest, expect, describe, it, beforeEach } from '@jest/globals';

// Define the keys type to match the expected environment variables
type EnvKey = 'chatApiEndpoint' | 'defaultChatLocation' | 'googleMapsApiKey' | 'buildDate' | 'gitSha';

// Force specific values for the mocks - do NOT rely on process.env
const TEST_ENV_VALUES: Record<EnvKey, string> = {
  chatApiEndpoint: 'https://api.example.com/chat',
  defaultChatLocation: 'dqcjqcp0',
  googleMapsApiKey: 'test_google_maps_api_key',
  buildDate: '2023-10-10',
  gitSha: 'abcdef1234567890',
};

// Mock the Constants module that's imported by Env.ts
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: TEST_ENV_VALUES
  }
}));

// Create functions to test individual environment variables
const testEnvVariable = (variableName: string, configKey: EnvKey) => {
  describe(`${variableName}`, () => {
    beforeEach(() => {
      jest.resetModules();

      // Re-apply our mock to ensure it's not overridden
      jest.doMock('expo-constants', () => ({
        expoConfig: {
          extra: TEST_ENV_VALUES
        }
      }));
    });

    it('should be defined with valid value', () => {
      // Import the module to test the environment variable
      const Env = require('../../constants/Env');
      expect(Env[variableName]).toBeDefined();
      expect(typeof Env[variableName]).toBe('string');
    });

    it('should throw error when missing', () => {
      // Make the variable undefined in Constants
      const modifiedValues: Record<EnvKey, string | undefined> = { ...TEST_ENV_VALUES };
      modifiedValues[configKey] = undefined;

      jest.doMock('expo-constants', () => ({
        expoConfig: {
          extra: modifiedValues
        }
      }));

      // Try to import the module - should throw
      expect(() => {
        const Env = require('../../constants/Env');
        // Access the property to trigger the error if it hasn't already thrown
        console.log(Env[variableName]);
      }).toThrow();
    });

    it('should throw error when set to an invalid placeholder value', () => {
      // Make the variable a placeholder in Constants
      const modifiedValues: Record<EnvKey, string | undefined> = { ...TEST_ENV_VALUES };
      modifiedValues[configKey] = configKey.toUpperCase(); // This matches the check in getEnvVariable

      jest.doMock('expo-constants', () => ({
        expoConfig: {
          extra: modifiedValues
        }
      }));

      // Try to import the module - should throw
      expect(() => {
        const Env = require('../../constants/Env');
        // Access the property to trigger the error if it hasn't already thrown
        console.log(Env[variableName]);
      }).toThrow();
    });
  });
};

describe('Environment Variables Tests', () => {
  // Test each required environment variable independently
  testEnvVariable('CHAT_API_ENDPOINT', 'chatApiEndpoint');
  testEnvVariable('DEFAULT_CHAT_LOCATION', 'defaultChatLocation');
  testEnvVariable('GOOGLE_MAPS_API_KEY', 'googleMapsApiKey');

  describe('Build Metadata', () => {
    beforeEach(() => {
      jest.resetModules();

      // Re-apply our mock to ensure it's not overridden
      jest.doMock('expo-constants', () => ({
        expoConfig: {
          extra: TEST_ENV_VALUES
        }
      }));
    });

    it('should provide BUILD_DATE', () => {
      const Env = require('../../constants/Env');
      expect(Env.BUILD_DATE).toBeDefined();
      expect(typeof Env.BUILD_DATE).toBe('string');
    });

    it('should provide GIT_SHA', () => {
      const Env = require('../../constants/Env');
      expect(Env.GIT_SHA).toBeDefined();
      expect(typeof Env.GIT_SHA).toBe('string');
    });
  });

  describe('Multiple environment variables', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('should detect all missing environment variables', () => {
      // Make all variables undefined in Constants
      jest.doMock('expo-constants', () => ({
        expoConfig: {
          extra: {
            // All variables are undefined
            chatApiEndpoint: undefined,
            defaultChatLocation: undefined,
            googleMapsApiKey: undefined,
            buildDate: undefined,
            gitSha: undefined,
          }
        }
      }));

      // Should throw when imported
      let threwError = false;
      try {
        require('../../constants/Env');
      } catch (error) {
        threwError = true;
      }
      expect(threwError).toBe(true);
    });
  });
});