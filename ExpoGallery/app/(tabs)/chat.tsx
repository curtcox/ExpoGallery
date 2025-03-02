import React, { useState, useCallback, useEffect } from 'react';
import { GiftedChat, IMessage, MessageTextProps } from 'react-native-gifted-chat';
import { MessageText } from 'react-native-gifted-chat';
import { TextStyle, Platform } from 'react-native';
import { generateBotResponse } from '@/services/chat';
import { router } from 'expo-router';

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
          avatar: 'https://placecats.com/140/140',
        },
      },
    ]);
  }, []);

  const RouteLinker = (props: MessageTextProps<IMessage>) => {
    const parsePatterns = useCallback((_linkStyle: TextStyle) => {
      return [
        {
          pattern: /(\/\w+(?:\/\w+)*(?:\?\w+=[\w-]+(?:&\w+=[\w-]+)*)?)/g,
          style: { color: '#9c27b0', textDecorationLine: 'underline' },
          onPress: (route: string) => {
            router.push(route as any);
          },
        },
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
        const botResponseText = await generateBotResponse(userMessage);
        const botMessage: IMessage = {
          _id: Math.round(Math.random() * 1000000),
          text: botResponseText,
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placecats.com/140/140',
          },
        };
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, [botMessage]),
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
      renderMessageText={props => <RouteLinker {...props} />}
    />
  );
}