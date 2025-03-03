import React, { useState, useCallback, useEffect } from 'react';
import { Platform, TextStyle } from 'react-native';
import GiftedChat, { IMessage, MessageTextProps, MessageText } from '@/components/Chat';
import { generateBotResponse } from '@/services/chat';
import { router } from 'expo-router';
import { subscribeToMessageChanges, updateMessages } from '@/storage/messages';

const isServerSideRendering = () => {
  return Platform.OS === 'web' && typeof window === 'undefined';
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);

  useEffect(() => {
    // Subscribe to message changes
    const unsubscribe = subscribeToMessageChanges((storedMessages) => {
      if (storedMessages.length === 0) {
        // If no stored messages, set the initial welcome message
        const welcomeMessage = {
          _id: 1,
          text: 'How can I help you?',
          createdAt: new Date(),
          user: {
            _id: 2,
            name: 'React Native',
            avatar: 'https://placecats.com/140/140',
          },
        };
        setMessages([welcomeMessage]);
        updateMessages([welcomeMessage]);
      } else {
        setMessages(storedMessages);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    // Update local state and storage with user message
    const updatedMessages = GiftedChat.append(messages, newMessages);
    setMessages(updatedMessages);
    await updateMessages(updatedMessages);

    // Generate a response to the user's message
    if (newMessages.length > 0) {
      const userMessage = newMessages[0].text;

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

        // Update local state and storage with bot response
        const messagesWithBot = GiftedChat.append(updatedMessages, [botMessage]);
        setMessages(messagesWithBot);
        await updateMessages(messagesWithBot);
      } catch (error) {
        console.error('Failed to get bot response:', error);
      }
    }
  }, [messages]);

  const RouteLinker = (props: MessageTextProps<IMessage>) => {
    const parsePatterns = useCallback((_linkStyle: TextStyle) => {
      return [
        {
          pattern: /(?<!\/)(\/\w+(?:\/\w+)*(?:\?\w+=[\w-]+(?:&\w+=[\w-]+)*)?)/g,
          style: { color: '#9c27b0', textDecorationLine: 'underline' },
          onPress: (route: string) => {
            router.push(route as any);
          },
        },
      ] as any; // Using type assertion to resolve type mismatch
    }, []);
    return <MessageText {...props} parsePatterns={parsePatterns} />;
  };

  if (isServerSideRendering()) {
    return null;
  }

  return (
    <GiftedChat
      messages={messages}
      onSend={onSend}
      user={{ _id: 1 }}
      renderMessageText={props => <RouteLinker {...props} />}
    />
  );
}