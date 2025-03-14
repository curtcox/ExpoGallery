import { ChatContext } from './localBot';
import { ERROR_MESSAGES, ChatServiceError } from './chatService';
import { latLongToGeohash } from './location';

export const CHAT_API_ENDPOINT = 'http://54.147.61.224:5000/chat';
/**
 * Fetches a response from an external API
 * @param userMessage The message from the user
 * @param context The chat context including user profile, location, etc.
 * @returns A promise that resolves to the bot's response
 * @throws ChatServiceError with errorType property indicating the type of error
 */
export const fetchExternal = async (userMessage: string, context: ChatContext): Promise<string> => {
  try {
    // Convert location to geohash if available, or use a default geohash
    const locationId = context.location ?
      latLongToGeohash(context.location.latitude, context.location.longitude) :
      '9yzey5mxsb'; // Default location ID

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
      throw new ChatServiceError(`API request failed with status ${response.status}`, 'API_ERROR');
    }

    const data = await response.json();

    // The API returns a 'message' field in the response
    return data.message || ERROR_MESSAGES.GENERAL;
  } catch (e) {
    if (e instanceof ChatServiceError) {
      throw e;
    }
    throw new ChatServiceError(`Failed to fetch external response: ${e instanceof Error ? e.message : 'Unknown error'}`, 'API_ERROR');
  }
};