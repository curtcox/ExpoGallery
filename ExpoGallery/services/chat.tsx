import { IMessage } from 'react-native-gifted-chat';

/**
 * Generates a bot response based on user input
 */
export const generateBotResponse = (userMessage: string): IMessage => {
  let responseText = `You said: ${userMessage}`;

  // Check if the message contains any of our keywords
  if (/calculator/i.test(userMessage)) {
    responseText = 'I see you mentioned calculator! Tap on "calculator" to open it.';
  } else if (/weather/i.test(userMessage)) {
    responseText = 'Would you like to check the weather? Tap on "weather" to see the forecast.';
  } else if (/calendar/i.test(userMessage)) {
    responseText = 'Would you like to check your calendar? Tap on "calendar" to open it.';
  }

  const botResponse: IMessage = {
    _id: Math.round(Math.random() * 1000000),
    text: responseText,
    createdAt: new Date(),
    user: {
      _id: 2,
      name: 'React Native',
      avatar: 'https://placeimg.com/140/140/any',
    },
  };

  return botResponse;
};
