import { fetchExternal, CHAT_API_ENDPOINT } from '../externalChatService';
import { ChatContext } from '../localBot';
import { defaultProfile } from '../../storage/profile';
import { ERROR_MESSAGES } from '../chatService';

// Mock global fetch
global.fetch = jest.fn();

describe('externalChatService', () => {
  // Reset mocks between tests
  beforeEach(() => {
    jest.resetAllMocks();
  });

  const mockContext: ChatContext = {
    timestamp: new Date(),
    userProfile: defaultProfile,
    resources: [],
    location: {
      latitude: 38.6270,
      longitude: -90.1994,
    },
  };

  test('fetchExternal sends correct request format to the API', async () => {
    // Setup mock response
    const mockResponse = {
      conversationId: 'a7e5b533-90ff-467b-9832-8ed12fed38c2',
      message: 'This is a test response from the bot',
    };

    // Mock implementation
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Call the function
    const result = await fetchExternal('Food?', mockContext);

    // Verify the result matches the expected response
    expect(result).toBe(mockResponse.message);

    // Verify fetch was called correctly with location parameter
    expect(fetch).toHaveBeenCalledWith(CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Food?',
        location: '9yzgeryf9d',
      }),
    });
  });

  test('fetchExternal uses default location ID when context has no location', async () => {
    // Setup mock response
    const mockResponse = {
      conversationId: 'a7e5b533-90ff-467b-9832-8ed12fed38c2',
      message: 'This is a test response from the bot',
    };

    // Create context without location
    const contextWithoutLocation: ChatContext = {
      ...mockContext,
      location: undefined,
    };

    // Mock implementation
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Call the function
    await fetchExternal('Food?', contextWithoutLocation);

    // Verify fetch was called with default location ID
    expect(fetch).toHaveBeenCalledWith(CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Food?',
        location: '9yzey5mxsb',
      }),
    });
  });

  test('fetchExternal handles API errors appropriately', async () => {
    // Mock a failed response
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 500,
      })
    );

    // Each test will reuse the mock, so we need to call the function only once
    await expect(fetchExternal('Food?', mockContext)).rejects.toThrow(/API request failed with status 500/);
  });

  test('fetchExternal handles network errors appropriately', async () => {
    // Mock a network failure
    (fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.reject(new Error('Network failure'))
    );

    await expect(fetchExternal('Food?', mockContext)).rejects.toThrow(/Failed to fetch external response: Network failure/);
  });

  test('fetchExternal handles empty response appropriately', async () => {
    // Setup mock empty response
    const mockResponse = {};

    // Mock implementation
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    // Call the function and verify it returns the generic error message
    const result = await fetchExternal('Food?', mockContext);
    expect(result).toBe(ERROR_MESSAGES.GENERAL);
  });
});