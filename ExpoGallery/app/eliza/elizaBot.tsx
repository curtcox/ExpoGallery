/**
 * Local chatbot implementation with context-aware responses
 */

import { Profile } from '@/storage/profile';
import { Resource } from '@/services/data';
import { calculateDistance } from '@/services/location';

export interface ChatContext {
  timestamp: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  userProfile: Profile;
  resources: Resource[];
}

/**
 * Process user messages with context and return appropriate responses
 */
export const localBot = (userMessage: string, context: ChatContext): string => {
  const lowerCaseMessage = userMessage.toLowerCase();

  // Get nearby resources based on user location if available
  const getNearbyResource = (category: string): Resource | undefined => {
    if (!context.location) return;
    return context.resources
      .filter(r => r.category.toLowerCase() === category)
      .sort((a, b) => {
        const distA = calculateDistance(context.location!, a.location);
        const distB = calculateDistance(context.location!, b.location);
        return distA - distB;
      })[0];
  };

  // Get personalized shelter response
  const getShelterResponse = () => {
    const shelter = getNearbyResource('shelter');
    if (shelter) {
      return `Hello ${context.userProfile.name}, I found a shelter near you: ${shelter.name} at ${shelter.location.address}. Tap here for more information: /${shelter.id}`;
    }
    return 'It sounds like you need a place to stay. Let me help you find a shelter in your area.';
  };

  // Get personalized food response
  const getFoodResponse = () => {
    const foodBank = getNearbyResource('food');
    if (foodBank) {
      return `Hello ${context.userProfile.name}, I found a food bank near you: ${foodBank.name} at ${foodBank.location.address}. Tap here for more information: /${foodBank.id}`;
    }
    return 'It sounds like you need some food. Let me help you find food resources in your area.';
  };

  const rules = [
    { keywords: ['thank'],                         response: `You're welcome${context.userProfile.name ? ' ' + context.userProfile.name : ''}! Is there anything else I can help with?` },
    { keywords: ['help'],                          response: `How can I help you${context.userProfile.name ? ' ' + context.userProfile.name : ''}?` },
    { keywords: ['shelter', 'stay', 'sleep'],      response: getShelterResponse() },
    { keywords: ['food', 'eat', 'hungry', 'meal'], response: getFoodResponse() },
  ];

  for (const rule of rules) {
    if (rule.keywords.some(keyword => lowerCaseMessage.includes(keyword))) {
      return rule.response;
    }
  }

  return `How can I help you${context.userProfile.name ? ' ' + context.userProfile.name : ''}?`;
};