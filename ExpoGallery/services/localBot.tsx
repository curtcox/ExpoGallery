/**
 * Local chatbot implementation with keyword-based responses
 */

/**
 * Process user messages and return appropriate responses based on keyword matching
 */
export const localBot = (userMessage: string): string => {
  const lowerCaseMessage = userMessage.toLowerCase();
  const shelter_response = 'It sounds like you need a place to stay. Tap here for more information on Turning Point which is a shelter in your area. /9yzmw5s3k4';
  const food_response = 'It sounds like you need some food. Tap here for more information on Bread of Life which distributes food in your area. /9yzt8n628y';
  const rules = [
    { keywords: ['thank'],                         response: "You're welcome! Is there anything else I can help with?" },
    { keywords: ['help'],                          response: 'How can I help you?' },
    { keywords: ['shelter', 'stay', 'sleep'],      response: shelter_response },
    { keywords: ['food', 'eat', 'hungry', 'meal'], response: food_response },
  ];

  for (const rule of rules) {
    if (rule.keywords.some(keyword => lowerCaseMessage.includes(keyword))) {
      return rule.response;
    }
  }

  return "How can I help you?";
};