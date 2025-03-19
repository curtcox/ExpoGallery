import { ChatContext } from './localBot';
import { ERROR_MESSAGES, ChatServiceError } from './chatService';
import { latLongToGeohash } from './location';
import { CHAT_API_ENDPOINT, DEFAULT_CHAT_LOCATION } from '../constants/Env';
import { error, warn } from '@/utils/index';
// Re-export the API endpoint for tests
export { CHAT_API_ENDPOINT };

/**
 * Fetches a response from an external API
 * @param userMessage The message from the user
 * @param context The chat context including user profile, location, etc.
 * @returns A promise that resolves to the bot's response
 * @throws ChatServiceError with errorType property indicating the type of error
 */
export const fetchExternal = async (userMessage: string, context: ChatContext): Promise<string> => {
  try {
    // Convert location to geohash if available, or use the default geohash from environment
    const locationId = context.location ?
      latLongToGeohash(context.location.latitude, context.location.longitude) :
      DEFAULT_CHAT_LOCATION;

    const response = await fetch(CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMessage,
        location: locationId
      }),
    });

    if (!response.ok) {
      warn(`API request failed with status ${response.status} accessing [${CHAT_API_ENDPOINT}]`);
      throw new ChatServiceError(`API request failed with status ${response.status}`, 'API_ERROR');
    }

    const data = await response.json();

    // The API returns a 'message' field in the response
    return data.message || ERROR_MESSAGES.GENERAL;
  } catch (e) {
    error(`Error fetching from [${CHAT_API_ENDPOINT}]`,e);
    if (e instanceof ChatServiceError) {
      throw e;
    }
    throw new ChatServiceError(`Failed to fetch external response: ${e instanceof Error ? e.message : 'Unknown error'}`, 'API_ERROR');
  }
};