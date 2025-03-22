import { error } from '@/utils/index';
import { localBot, ChatContext, BotResponse } from './elizaBot';
import { profile } from '@/storage/profile';
import { getAllResources } from '@/services/data';
import { LocationObject } from 'expo-location';
import { getCurrentLocation } from '@/services/location';
import { IMessage } from '@/components/Chat';
import { ResponseDetails } from './eliza';

// Error messages
export const ERROR_MESSAGES = {
  GENERAL: 'Sorry, I encountered an error. Please try again.',
  TIMEOUT: 'Sorry, the response took too long. Please try again.',
  API_ERROR: 'Sorry, I could not process your request due to an API error.',
  LOCATION_ERROR: 'I could not access your location, but I will try to help anyway.'
};

// Bot user info for message generation
export const BOT_USER = {
  _id: 2,
  name: 'React Native',
  avatar: 'https://placecats.com/140/140',
};

export class ChatServiceError extends Error {
  constructor(message: string, public readonly errorType: keyof typeof ERROR_MESSAGES = 'GENERAL') {
    super(message);
    this.name = 'ChatServiceError';
  }
}

export interface ChatResult {
  message: string;
  hasLocation: boolean;
  details: ResponseDetails;
}

/**
 * Process a user message and generate a response
 * This function handles all error cases and location fetching internally
 * @param userMessage The message from the user
 * @param timeoutDuration Optional timeout duration in milliseconds (defaults to settings value)
 * @returns A promise that resolves to an object with the message and location status
 */
export const processUserMessage = async (userMessage: string, timeoutDuration?: number): Promise<ChatResult> => {
  let location: LocationObject | null = null;
  let hasLocation = false;

  // Try to get location but don't fail if we can't
  try {
    location = await getCurrentLocation();
    hasLocation = !!location;
  } catch (e) {
    error('Error getting location:', e);
  }

  try {
    // Generate bot response with or without location
    const response = await generateBotResponse(userMessage, location, timeoutDuration);
    return {
      message: response.message,
      hasLocation,
      details: response.details
    };
  } catch (e) {
    error('Error in processUserMessage:', e);

    // Determine which error message to return based on the error type
    if (e instanceof ChatServiceError) {
      return {
        message: ERROR_MESSAGES[e.errorType],
        hasLocation,
        details: {
          sanitizedInput: userMessage,
          matchedKeywords: [],
          isGenericResponse: true
        }
      };
    }

    // Default error message for unexpected errors
    return {
      message: ERROR_MESSAGES.GENERAL,
      hasLocation,
      details: {
        sanitizedInput: userMessage,
        matchedKeywords: [],
        isGenericResponse: true
      }
    };
  }
};

/**
 * Creates a bot message object ready to be added to the chat
 * @param text The text content of the message
 * @returns An IMessage object for the bot
 */
export const createBotMessage = (text: string): IMessage => {
  return {
    _id: Math.round(Math.random() * 1000000),
    text,
    createdAt: new Date(),
    user: BOT_USER,
  };
};

/**
 * Generate a bot response with built-in timeout and error handling
 * @param userMessage The message from the user
 * @param location The user's current location (if available)
 * @param timeoutDuration Optional timeout duration in milliseconds (defaults to settings value)
 * @returns A promise that resolves to the bot's response
 * @throws ChatServiceError with errorType property indicating the type of error
 */
export const generateBotResponse = async (
  userMessage: string,
  location: LocationObject | null,
  timeoutDuration?: number
): Promise<BotResponse> => {
  try {
    const context: ChatContext = {
      timestamp: new Date(),
      location: location ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      } : undefined,
      userProfile: profile,
      resources: await getAllResources(),
    };

    return localBot(userMessage, context);
  } catch (e) {
    error('Error generating bot response:', e);

    // Return appropriate error based on the type of error
    if (e instanceof ChatServiceError) {
      throw e; // Re-throw ChatServiceError for the component to handle
    } else {
      throw new ChatServiceError('An unexpected error occurred', 'GENERAL');
    }
  }
};