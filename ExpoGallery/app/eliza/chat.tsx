import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Platform, TextStyle, View, StyleSheet, Text, ScrollView, PanResponder, Animated, ViewStyle } from 'react-native';
import GiftedChat, { IMessage, MessageTextProps, MessageText } from '@/components/Chat';
import {
  createBotMessage,
  processUserMessage,
  BOT_USER
} from './elizaService';
import { router } from 'expo-router';
import { subscribeToMessageChanges, updateMessages } from '@/storage/messages';
import { error, info } from '@/utils/logger';
import { getCurrentLocation } from '@/services/location';
import LocationIndicator from '@/components/LocationIndicator';
import { ResponseDetails } from './eliza';

const isServerSideRendering = () => {
  return Platform.OS === 'web' && typeof window === 'undefined';
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [hasLocation, setHasLocation] = useState<boolean | null>(null);
  const [responseDetails, setResponseDetails] = useState<ResponseDetails | null>(null);
  const [splitWidth, setSplitWidth] = useState(Platform.OS === 'web' ? 400 : 300);
  const pan = useRef(new Animated.Value(splitWidth)).current;
  const containerWidth = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newWidth = splitWidth + gestureState.dx;
        if (newWidth >= 250 && newWidth <= 500) {
          pan.setValue(newWidth);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        const newWidth = splitWidth + gestureState.dx;
        const clampedWidth = Math.min(Math.max(newWidth, 250), 500);
        setSplitWidth(clampedWidth);
        pan.setValue(clampedWidth);
      },
    })
  ).current;

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
      return;
    }

    const updatedMessages = GiftedChat.append(messages, newMessages);
    setMessages(updatedMessages);
    await updateMessages(updatedMessages);

    const userMessage = newMessages[0].text;
    const result = await processUserMessage(userMessage);

    setHasLocation(result.hasLocation);
    setResponseDetails(result.details);

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

  const renderResponseDetails = () => {
    if (!responseDetails) return null;

    return (
      <ScrollView style={styles.detailsPanel}>
        <Text style={styles.detailsTitle}>Response Details</Text>
        <Text style={styles.detailsLabel}>Sanitized Input:</Text>
        <Text style={styles.detailsText}>{responseDetails.sanitizedInput}</Text>

        <Text style={styles.detailsLabel}>Matched Keywords:</Text>
        <Text style={styles.detailsText}>
          {responseDetails.matchedKeywords.map(k => `${k.word} (priority: ${k.priority})`).join('\n')}
        </Text>

        {responseDetails.isGenericResponse ? (
          <Text style={styles.detailsText}>Using generic response</Text>
        ) : responseDetails.usedRule ? (
          <>
            <Text style={styles.detailsLabel}>Used Rule:</Text>
            <Text style={styles.detailsText}>Pattern: {responseDetails.usedRule.pattern}</Text>
            <Text style={styles.detailsText}>Response template: {responseDetails.usedRule.response}</Text>
          </>
        ) : (
          <Text style={styles.detailsText}>Using keyword response without decomposition rule</Text>
        )}

        {responseDetails.alternativeResponses && responseDetails.alternativeResponses.length > 0 && (
          <>
            <Text style={[styles.detailsLabel, styles.alternativesHeader]}>Alternative Responses:</Text>
            {responseDetails.alternativeResponses.map((alt, index) => (
              <View key={index} style={styles.alternativeResponse}>
                <Text style={styles.alternativeKeyword}>
                  {alt.keyword} (priority: {alt.priority})
                </Text>
                {alt.pattern && (
                  <Text style={styles.detailsText}>Pattern: {alt.pattern}</Text>
                )}
                <Text style={styles.detailsText}>
                  Possible responses:{'\n'}
                  {alt.possibleResponses.map((resp, i) => `${i + 1}. ${resp}`).join('\n')}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      <LocationIndicator top={10} right={20} size={14} hasLocation={hasLocation} />
      <View
        style={styles.splitContainer}
        onLayout={(e) => containerWidth.setValue(e.nativeEvent.layout.width)}
      >
        <Animated.View
          style={[
            styles.chatContainer,
            {
              width: Animated.subtract(containerWidth, pan)
            }
          ]}
        >
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{ _id: 1 }}
            renderMessageText={props => <RouteLinker {...props} />}
          />
        </Animated.View>

        <View {...panResponder.panHandlers} style={styles.splitter} />

        <Animated.View style={[styles.detailsContainer, { width: pan }]}>
          {renderResponseDetails()}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  chatContainer: {
    flex: 1,
  },
  detailsContainer: {
    backgroundColor: '#f5f5f5',
    borderLeftWidth: 1,
    borderLeftColor: '#ddd',
  },
  splitter: Platform.OS === 'web'
    ? {
        width: 8,
        backgroundColor: '#e0e0e0',
        cursor: 'col-resize' as ViewStyle['cursor'],
      }
    : {
        width: 8,
        backgroundColor: '#e0e0e0',
      },
  detailsPanel: {
    flex: 1,
    padding: 10,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    color: '#666',
  },
  detailsText: {
    fontSize: 14,
    marginTop: 4,
    marginBottom: 8,
  },
  alternativesHeader: {
    marginTop: 16,
    fontSize: 15,
    color: '#444',
  },
  alternativeResponse: {
    marginTop: 8,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#ddd',
  },
  alternativeKeyword: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 4,
  },
});