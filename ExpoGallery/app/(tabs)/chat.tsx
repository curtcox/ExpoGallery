import React, { useState, useCallback, useEffect } from 'react';
import { Platform, TextStyle, View, StyleSheet } from 'react-native';
import GiftedChat, { IMessage, MessageTextProps, MessageText } from '@/components/Chat';
import {
  createBotMessage,
  processUserMessage,
  BOT_USER
} from '@/services/chatService';
import { router } from 'expo-router';
import { subscribeToMessageChanges, updateMessages } from '@/storage/messages';
import { error, info } from '@/utils/logger';
import { getCurrentLocation } from '@/services/location';
import LocationIndicator from '@/components/LocationIndicator';

const isServerSideRendering = () => {
  return Platform.OS === 'web' && typeof window === 'undefined';
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [hasLocation, setHasLocation] = useState<boolean | null>(null);

  // Log when chat tab is loaded
  useEffect(() => {
    info('Chat tab loaded');
  }, []);

  // Check location status periodically
  useEffect(() => {
    const checkLocation = async () => {
      try {
        const location = await getCurrentLocation();
        setHasLocation(!!location);
      } catch (e) {
        error('Error checking location:', e);
        setHasLocation(false);
      }
    };

    // Check location immediately when component mounts
    checkLocation();

    // Set up interval to check location every second
    const intervalId = setInterval(checkLocation, 1000);

    // Clean up interval when component unmounts
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    // Subscribe to message changes
    const unsubscribe = subscribeToMessageChanges((storedMessages) => {
      if (storedMessages.length === 0) {
        // If no stored messages, set the initial welcome message
        const welcomeMessage = {
          _id: 1,
          text: 'How can I help you?',
          createdAt: new Date(),
          user: BOT_USER,
        };
        setMessages([welcomeMessage]);
        updateMessages([welcomeMessage]).catch(e =>
          error('Failed to update storage with welcome message:', e)
        );
      } else {
        setMessages(storedMessages as IMessage[]);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  /**
   * Handle sending a message - this is simplified with no try/catch blocks
   */
  const onSend = useCallback(async (newMessages: IMessage[] = []) => {
    if (newMessages.length === 0 || !newMessages[0].text.trim()) {
      return; // Don't process empty messages
    }

    // Update local state and storage with user message
    const updatedMessages = GiftedChat.append(messages, newMessages);
    setMessages(updatedMessages);
    await updateMessages(updatedMessages);

    // Process user message through service layer
    const userMessage = newMessages[0].text;
    const result = await processUserMessage(userMessage);

    // Update location state
    setHasLocation(result.hasLocation);

    // Create and add bot response message
    const botMessage = createBotMessage(result.message);
    const messagesWithResponse = GiftedChat.append(updatedMessages, [botMessage]);
    setMessages(messagesWithResponse);
    await updateMessages(messagesWithResponse);
  }, [messages]);

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
    <View style={styles.container}>
      <LocationIndicator top={10} right={20} size={14} hasLocation={hasLocation} />
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: 1 }}
        renderMessageText={props => <RouteLinker {...props} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});