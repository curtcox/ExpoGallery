import { error } from '@/utils/index';
import { localBot } from './localBot';

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

const getResponseText = async (userMessage: string): Promise<string> => EXTERNAL ? await fetchExternal(userMessage) : localBot(userMessage)

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