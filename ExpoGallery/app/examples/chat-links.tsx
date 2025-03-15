import React, { useState, useCallback, useEffect } from 'react';
import GiftedChat from '@/components/Chat';
import { IMessage, MessageTextProps, MessageText } from '@/components/Chat';
import { oneButtonAlert } from '@/utils/alerts';

export default function Example() {
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello! Ask me about calculator, weather, or any other services.',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ]);
  }, []);

  // Custom component that properly handles custom keywords
  const CustomMessageText = (props: MessageTextProps<IMessage>) => {
    // The key is to provide a function that returns a properly formatted array
    // of patterns for ParsedText to use
    const parsePatterns = useCallback((linkStyle: any) => {
      return [
        {
          pattern: /\bcalculator\b/i,
          style: { color: '#0366d6', textDecorationLine: 'underline' },
          onPress: () => {
            oneButtonAlert('Calculator : Opening calculator feature');
          },
        },
        {
          pattern: /\bweather\b/i,
          style: { color: '#2c974b', textDecorationLine: 'underline' },
          onPress: () => {
            oneButtonAlert('Weather: Checking weather information');
          },
        },
        {
          pattern: /\bcalendar\b/i,
          style: { color: '#a0522d', textDecorationLine: 'underline' },
          onPress: () => {
            oneButtonAlert('Calendar: Opening your calendar');
          },
        },
        // These are the default patterns that GiftedChat uses
        { type: 'url',   style: linkStyle, onPress: (url: string)   => oneButtonAlert('Opening URL' + url) },
        { type: 'phone', style: linkStyle, onPress: (phone: string) => oneButtonAlert('Calling ' +phone) },
        { type: 'email', style: linkStyle, onPress: (email: string) => oneButtonAlert('Sending Email ' + email) },
      ];
    }, []);

    return <MessageText {...props} parsePatterns={parsePatterns} />;
  };

  // Function to generate a bot response
  const generateBotResponse = useCallback((userMessage: string) => {
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
  }, []);

  const onSend = useCallback((messages: IMessage[] = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    );

    // Generate a response to the user's message
    if (messages.length > 0) {
      const userMessage = messages[0].text;

      // Add a small delay to make it feel more natural
      setTimeout(() => {
        const botResponse = generateBotResponse(userMessage);
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, [botResponse]),
        );
      }, 1000);
    }
  }, [generateBotResponse]);

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: 1,
      }}
      renderMessageText={props => <CustomMessageText {...props} />}
    />
  );
}