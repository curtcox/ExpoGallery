import { error } from '@/utils/index';

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

const getResponseText = async (userMessage: string): Promise<string> => EXTERNAL ? await fetchExternal(userMessage) : generateLocal(userMessage)

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

const generateLocal = (userMessage: string): string => {
  const lowerCaseMessage = userMessage.toLowerCase();

  const rules = [
    { keywords: ['hello', 'hi'], response: 'Hello there! How can I help you today?' },
    { keywords: ['calculator'],  response: 'Would you like to use the calculator feature?' },
    { keywords: ['weather'],     response: 'I can help you check the weather. What city are you interested in?' },
    { keywords: ['calendar'],    response: 'I can help you with your calendar. Would you like to view or add an event?' },
    { keywords: ['help'],        response: 'I can help with various tasks. Try asking about calculator, weather, or calendar features.' },
    { keywords: ['thank'],       response: "You're welcome! Is there anything else I can help with?" }
  ];

  for (const rule of rules) {
    if (rule.keywords.some(keyword => lowerCaseMessage.includes(keyword))) {
      return rule.response;
    }
  }

  return "I'm not sure how to respond to that. You can ask about calculator, weather, or calendar features.";
};
