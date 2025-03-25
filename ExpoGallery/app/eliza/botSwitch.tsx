/**
 * Local chatbot implementation with context-aware responses
 */

import { ResponseDetails } from './ibot';
import { Eliza } from './eliza';
import { Profile } from '@/storage/profile';
import { Resource } from '@/services/data';
// import { Bitsy } from './bitsy';
export interface ChatContext {
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  userProfile: Profile;
  resources: Resource[];
}

export interface BotResponse {
  message: string;
  details: ResponseDetails;
  hasLocation?: boolean;
}

/**
 * Process user messages with context and return appropriate responses
 */
export const localBot = (userMessage: string, context: ChatContext): BotResponse => {
  // const bot = (true) ? new Bitsy() : new Eliza();
  const bot = new Eliza();
  const { response, details } = bot.getResponse(userMessage);
  return {
    message: response,
    details,
    hasLocation: !!context.location
  };
}