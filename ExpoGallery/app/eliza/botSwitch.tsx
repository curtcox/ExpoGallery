/**
 * Local chatbot implementation with context-aware responses
 */

import { ResponseDetails } from './ibot';
import { KeyBot } from './keyBot';
import { Profile } from '@/storage/profile';
import { Resource } from '@/services/data';
import { allRules } from './elizaRules';
import { allFunctions } from './functions';
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
  const rules = (false) ? allRules : allFunctions;
  const bot = new KeyBot(rules);
  const { response, details } = bot.getResponse(userMessage);
  return {
    message: response,
    details,
    hasLocation: !!context.location
  };
}