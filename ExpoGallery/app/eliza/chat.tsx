import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Platform, TextStyle, View, StyleSheet, Text, ScrollView, PanResponder, Animated, ViewStyle } from 'react-native';
import GiftedChat, { IMessage, MessageTextProps, MessageText } from '@/components/Chat';
import {
  createBotMessage,
  processUserMessage,
  BOT_USER
} from './botService';
import { Link, router } from 'expo-router';
import { subscribeToMessageChanges, updateMessages } from '@/storage/messages';
import { error, info } from '@/utils/logger';
import { getCurrentLocation } from '@/services/location';
import { ResponseDetails } from './ibot';

const isServerSideRendering = () => {
  return Platform.OS === 'web' && typeof window === 'undefined';
};

export const getPriorityColor = (priority: number): string => {
  // Color scale from high priority (warm colors) to low priority (cool colors)
  const colors = [
    '#ffcdd2', // Priority 0 (lowest) - Light red
    '#fff9c4', // Priority 1 - Light yellow
    '#c8e6c9', // Priority 2 - Light green
    '#bbdefb', // Priority 3 - Light blue
    '#e1bee7', // Priority 4 - Light purple
  ];
  return colors[Math.min(priority, colors.length - 1)] || colors[0];
};

export const HighlightedText = ({ text, keywords }: { text: string, keywords: Array<{ word: string; priority: number }> }) => {
  // Sort keywords by length (descending) to handle overlapping matches correctly
  const sortedKeywords = [...keywords].sort((a, b) => b.word.length - a.word.length);

  // Create segments with highlighting information
  let segments: Array<{ text: string; priority?: number }> = [{ text }];

  sortedKeywords.forEach(({ word, priority }) => {
    segments = segments.flatMap(segment => {
      if (segment.priority !== undefined) return [segment]; // Skip already highlighted segments

      // Find word variations: exact match, plural/singular forms, and stemmed versions
      const wordPattern = word.endsWith('s') ?
        `\\b(${word}|${word.slice(0, -1)})\\b` : // If keyword ends in 's', match with and without it
        `\\b(${word}|${word}s)\\b`; // Otherwise match with and without 's'

      const parts = segment.text.split(new RegExp(wordPattern, 'gi'));
      return parts.map(part => {
        // Check if this part matches any variation of the word
        const isMatch = new RegExp(wordPattern, 'i').test(part);
        return isMatch ? { text: part, priority } : { text: part };
      });
    });
  });

  return (
    <Text>
      {segments.map((segment, index) => (
        <Text
          key={index}
          style={segment.priority !== undefined ? {
            backgroundColor: getPriorityColor(segment.priority),
            borderRadius: 2,
            paddingHorizontal: 2,
          } : undefined}
        >
          {segment.text}
        </Text>
      ))}
    </Text>
  );
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
    if (!responseDetails) return (
      <View style={styles.detailsPanel}>
          <Text style={styles.detailsText}>Very simple Eliza chatbot adapted from </Text>
          <Link href="https://github.com/Adventvr/Eliza" style={styles.link}>Adventvr/Eliza</Link>
           <Text style={styles.detailsText}>A more complex version is available </Text>
          <Link href="https://curtcox.github.io/elizabot-js/" style={styles.link}>here.</Link>
      </View>
    );

    return (
      <ScrollView style={styles.detailsPanel}>
        <Text style={styles.detailsTitle}>Response Details</Text>
        <Text style={styles.detailsLabel}>Sanitized Input:</Text>
        <View style={styles.sanitizedInputContainer}>
          <HighlightedText
            text={responseDetails.sanitizedInput}
            keywords={responseDetails.matchedKeywords}
          />
        </View>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
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
    fontSize: 16,
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
  sanitizedInputContainer: {
    marginVertical: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  keywordsContainer: {
    marginTop: 8,
  },
  keywordItem: {
    marginBottom: 12,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: '#ddd',
  },
  patternText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  responsesText: {
    fontSize: 14,
    color: '#444',
    marginTop: 4,
    marginLeft: 8,
  },
  link: {
    fontSize: 16,
    color: '#2196F3',
    textDecorationLine: 'underline',
    marginVertical: 4,
  },
});