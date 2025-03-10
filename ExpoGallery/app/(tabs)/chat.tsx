import React, { useState, useCallback, useEffect } from 'react';
import { Platform, TextStyle } from 'react-native';
import GiftedChat, { IMessage, MessageTextProps, MessageText } from '@/components/Chat';
import { generateBotResponse } from '@/services/chat';
import { router } from 'expo-router';
import { subscribeToMessageChanges, updateMessages } from '@/storage/messages';
import { error } from '@/utils/logger';

const isServerSideRendering = () => {
  return Platform.OS === 'web' && typeof window === 'undefined';
};

// Timeout duration in milliseconds (30 seconds)
const RESPONSE_TIMEOUT = 30000;

// Error messages
const ERROR_MESSAGE = 'Sorry, I encountered an error. Please try again.';
const TIMEOUT_MESSAGE = 'Sorry, the response took too long. Please try again.';

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
        setMessages(storedMessages as IMessage[]);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  /**
   * Add an error message to the chat
   */
  const showErrorMessage = useCallback(async (errorText: string, updatedMessages: IMessage[]) => {
    const errorMessage: IMessage = {
      _id: Math.round(Math.random() * 1000000),
      text: errorText,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'React Native',
        avatar: 'https://placecats.com/140/140',
      },
    };

    const messagesWithError = GiftedChat.append(updatedMessages, [errorMessage]);
    setMessages(messagesWithError);
    await updateMessages(messagesWithError);
  }, []);

  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    // Update local state and storage with user message
    const updatedMessages = GiftedChat.append(messages, newMessages);
    setMessages(updatedMessages);
    await updateMessages(updatedMessages);

    // Generate a response to the user's message
    if (newMessages.length > 0 && newMessages[0].text.trim()) {
      const userMessage = newMessages[0].text;

      try {
        // Set up a timeout promise that rejects after the specified time
        const timeoutPromise = new Promise<string>((_, reject) => {
          const id = setTimeout(() => {
            clearTimeout(id);
            reject(new Error('Response timeout'));
          }, RESPONSE_TIMEOUT);
        });

        // Race between the actual response and the timeout
        const botResponseText = await Promise.race([
          generateBotResponse(userMessage),
          timeoutPromise
        ]);

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
      } catch (e) {
        error('Failed to get bot response:', e);

        // Show a specific message for timeout errors, generic message for other errors
        const errorText = e instanceof Error && e.message === 'Response timeout'
          ? TIMEOUT_MESSAGE
          : ERROR_MESSAGE;

        await showErrorMessage(errorText, updatedMessages);
      }
    }
  }, [messages, showErrorMessage]);

  const RouteLinker = (props: MessageTextProps) => {
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