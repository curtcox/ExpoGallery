import { jest, expect, describe, it, beforeEach } from '@jest/globals';
import { processUserMessage, generateBotResponse, ChatServiceError, ERROR_MESSAGES } from '../chatService';
import { fetchExternal } from '../externalChatService';
import { localBot } from '../localBot';
import { getCurrentLocation } from '../location';
import { getAllResources } from '../data';

// Mock all dependencies
jest.mock('../externalChatService');
jest.mock('../localBot');
jest.mock('../location');
jest.mock('../data');

// Mock profiles
jest.mock('../../storage/profile', () => ({
  profile: {
    name: 'Test User',
  },
}));

describe('Chat Service', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations
    (getCurrentLocation as jest.Mock).mockResolvedValue({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      },
    });

    (fetchExternal as jest.Mock).mockResolvedValue('External bot response');
    (localBot as jest.Mock).mockReturnValue('Local bot response');
    (getAllResources as jest.Mock).mockResolvedValue([]);
  });

  describe('processUserMessage', () => {
    it('should use a configurable timeout for testing', async () => {
      // Setup: External service will take a long time to respond
      (fetchExternal as jest.Mock).mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve('External response'), 500);
      }));

      // Test with a very short timeout (10ms)
      const result = await processUserMessage('Hello', 10);

      // Verify: We should get the local bot's response due to timeout
      expect(result.message).toBe('Local bot response');
      expect(fetchExternal).toHaveBeenCalled();
      expect(localBot).toHaveBeenCalled();
    });

    it('should return response from external service when it succeeds', async () => {
      const result = await processUserMessage('Hello');

      expect(result.message).toBe('External bot response');
      expect(fetchExternal).toHaveBeenCalled();
      expect(localBot).not.toHaveBeenCalled();
    });

    it('should fall back to local bot if external service fails', async () => {
      // Setup: External service will throw an error
      (fetchExternal as jest.Mock).mockRejectedValue(new Error('External service error'));

      const result = await processUserMessage('Hello');

      expect(result.message).toBe('Local bot response');
      expect(fetchExternal).toHaveBeenCalled();
      expect(localBot).toHaveBeenCalled();
    });

    it('should fall back to local bot if external service times out', async () => {
      // Setup: External service will take too long to respond
      (fetchExternal as jest.Mock).mockImplementation(() => new Promise(resolve => {
        setTimeout(() => resolve('External response'), 100);
      }));

      // Using a shorter timeout for the test
      const result = await processUserMessage('Hello', 10);

      expect(result.message).toBe('Local bot response');
    });

    it('should return an error message if both external and local bot fail', async () => {
      // Setup: Both services will fail
      (fetchExternal as jest.Mock).mockRejectedValue(new Error('External service error'));

      (localBot as jest.Mock).mockImplementation(() => {
        throw new Error('Local bot error');
      });

      const result = await processUserMessage('Hello');

      expect(result.message).toBe(ERROR_MESSAGES.GENERAL);
      expect(fetchExternal).toHaveBeenCalled();
      expect(localBot).toHaveBeenCalled();
    });

    it('should handle location errors gracefully', async () => {
      // Setup: Location service will fail
      (getCurrentLocation as jest.Mock).mockRejectedValue(
        new Error('Location error')
      );

      const result = await processUserMessage('Hello');

      // Should still get a response even without location
      expect(result.message).toBe('External bot response');
      expect(result.hasLocation).toBe(false);
    });
  });

  describe('generateBotResponse', () => {
    it('should timeout with custom duration and fall back to local bot', async () => {
      // External service will take too long
      (fetchExternal as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve('too late'), 100))
      );

      // Local bot returns a response
      (localBot as jest.Mock).mockReturnValue('Local bot response');

      // Use a very short timeout for testing (should fall back to local bot)
      const response = await generateBotResponse('Hello', null, 10);
      expect(response).toBe('Local bot response');
    });

    it('should throw a timeout error if both external and local bot fail', async () => {
      // External service will take too long
      (fetchExternal as jest.Mock).mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve('too late'), 100))
      );

      // Local bot also fails
      (localBot as jest.Mock).mockImplementation(() => {
        throw new Error('Local bot error');
      });

      // Use a very short timeout for testing
      let error: Error | undefined;
      try {
        await generateBotResponse('Hello', null, 10);
      } catch (e) {
        error = e as Error;
      }

      // Check if we got an error as expected
      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ChatServiceError);
      if (error instanceof ChatServiceError) {
        expect(error.errorType).toBe('GENERAL');
      }
    });

    it('should rethrow ChatServiceError with correct type', async () => {
      // Setup an API error
      (fetchExternal as jest.Mock).mockRejectedValue(
        new ChatServiceError('API error', 'API_ERROR')
      );

      // Local bot also fails
      (localBot as jest.Mock).mockImplementation(() => {
        throw new Error('Local bot error');
      });

      await expect(async () => {
        await generateBotResponse('Hello', null);
      }).rejects.toThrow(ChatServiceError);

      // Additional check to verify the error type
      let error: Error | undefined;
      try {
        await generateBotResponse('Hello', null);
      } catch (e) {
        error = e as Error;
      }

      expect(error).toBeDefined();
      expect(error).toBeInstanceOf(ChatServiceError);
      if (error instanceof ChatServiceError) {
        expect(error.errorType).toBe('GENERAL');
      }
    });
  });
});