import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage, MessageTextProps } from 'react-native-gifted-chat';
import { MessageText } from 'react-native-gifted-chat';
import { TextStyle, Platform } from 'react-native';
import { oneButtonAlert } from '@/utils/alerts';
import { generateBotResponse } from '@/services/chat';

const isServerSideRendering = () => {
  return Platform.OS === 'web' && typeof window === 'undefined';
};

export default function ChatTab() {
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'How can I help you?',
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
    // Fixed type annotation to match what MessageText expects
    const parsePatterns = useCallback((linkStyle: TextStyle) => {
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
      ] as any; // Using type assertion to resolve type mismatch
    }, []);

    return <MessageText {...props} parsePatterns={parsePatterns} />;
  };

  const onSend = useCallback(async (messages: IMessage[] = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    );

    // Generate a response to the user's message
    if (messages.length > 0) {
      const userMessage = messages[0].text;

      try {
        const botResponse = await generateBotResponse(userMessage);
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, [botResponse]),
        );
      } catch (error) {
        console.error('Failed to get bot response:', error);
      }
    }
  }, []);

  if (isServerSideRendering()) {
    return null;
  }

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