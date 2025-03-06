import { error } from '@/utils/index';
import { localBot, ChatContext } from './localBot';
import { profile } from '../storage/profile';
import { getAllResources } from './data';
import * as Location from 'expo-location';

export const CHAT_API_ENDPOINT = 'https://example.com/api/chat';
const EXTERNAL = false;

export const generateBotResponse = async (userMessage: string): Promise<string> => {
  try {
    return await getResponseText(userMessage);
  } catch (e) {
    error('Error generating bot response:', e);
    return getErrorMessage();
  }
};

const getResponseText = async (userMessage: string): Promise<string> => {
  if (EXTERNAL) {
    return await fetchExternal(userMessage);
  }

  // Create context with current data
  const context: ChatContext = {
    timestamp: new Date(),
    userProfile: { ...profile },
    resources: getAllResources()
  };

  // Try to get location if available
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      context.location = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
    }
  } catch (e) {
    error('Error getting location:', e);
  }

  return localBot(userMessage, context);
};

const fetchExternal = async (userMessage: string): Promise<string> => {
  const response = await fetch(CHAT_API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: userMessage }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.response || 'Sorry, I could not process your request.';
};

const getErrorMessage = (): string => {
  return 'Sorry, I encountered an error processing your message. Please try again later.';
};