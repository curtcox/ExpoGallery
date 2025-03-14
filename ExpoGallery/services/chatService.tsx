import { error } from '@/utils/index';
import { localBot, ChatContext } from './localBot';
import { profile } from '../storage/profile';
import { getAllResources } from './data';
import { LocationObject } from 'expo-location';
import { getCurrentLocation } from '@/services/location';
import { IMessage } from '@/components/Chat';

export const CHAT_API_ENDPOINT = 'https://example.com/api/chat';
const EXTERNAL = false;

// Timeout duration in milliseconds (30 seconds)
const RESPONSE_TIMEOUT = 30000;

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
}

/**
 * Process a user message and generate a response
 * This function handles all error cases and location fetching internally
 * @param userMessage The message from the user
 * @returns A promise that resolves to an object with the message and location status
 */
export const processUserMessage = async (userMessage: string): Promise<ChatResult> => {
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
    const botResponseText = await generateBotResponse(userMessage, location);
    return {
      message: botResponseText,
      hasLocation
    };
  } catch (e) {
    error('Error in processUserMessage:', e);

    // Determine which error message to return based on the error type
    if (e instanceof ChatServiceError) {
      return {
        message: ERROR_MESSAGES[e.errorType],
        hasLocation
      };
    }

    // Default error message for unexpected errors
    return {
      message: ERROR_MESSAGES.GENERAL,
      hasLocation
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
 * @returns A promise that resolves to the bot's response
 * @throws ChatServiceError with errorType property indicating the type of error
 */
export const generateBotResponse = async (userMessage: string, location: LocationObject | null): Promise<string> => {
  try {
    // Set up a timeout promise that rejects after the specified time
    const timeoutPromise = new Promise<never>((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new ChatServiceError('Response timeout', 'TIMEOUT'));
      }, RESPONSE_TIMEOUT);
    });

    // Race between the actual response and the timeout
    const startTime = Date.now();

    const response = await Promise.race([
      getResponseText(userMessage, location),
      timeoutPromise
    ]);

    const endTime = Date.now();
    return response;
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

const getResponseText = async (userMessage: string, location: LocationObject | null): Promise<string> => {
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
    return (EXTERNAL) ? fetchExternal(userMessage, context) : localBot(userMessage, context);
  } catch (e) {
    throw new ChatServiceError('Failed to process message', 'GENERAL');
  }
};

const fetchExternal = async (userMessage: string, context: ChatContext): Promise<string> => {

  try {
    const response = await fetch(CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage, context }),
    });

    if (!response.ok) {
      throw new ChatServiceError(`API request failed with status ${response.status}`, 'API_ERROR');
    }

    const data = await response.json();

    return data.response || ERROR_MESSAGES.GENERAL;
  } catch (e) {
    if (e instanceof ChatServiceError) {
      throw e;
    }
    throw new ChatServiceError(`Failed to fetch external response: ${e instanceof Error ? e.message : 'Unknown error'}`, 'API_ERROR');
  }
};