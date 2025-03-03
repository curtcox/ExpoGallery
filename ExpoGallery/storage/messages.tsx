import { error, storage } from '@/utils/index';
import { IMessage } from 'react-native-gifted-chat';

export type Message = IMessage;
export type Messages = Message[];

// Default messages
export const defaultMessages: Messages = [];

// Current messages (in memory)
export let messages: Messages = [...defaultMessages];

// Key for storing messages in storage
const MESSAGES_STORAGE_KEY = 'messages';

// Initialize messages from storage
export async function initMessages(): Promise<void> {
  try {
    const storedMessages = await storage.getItem(MESSAGES_STORAGE_KEY);
    if (storedMessages) {
      const parsedMessages = JSON.parse(storedMessages);
      messages = parsedMessages;
    }
  } catch (e) {
    error('Failed to load messages:', e);
  }
}

// Update messages with new values
export async function updateMessages(newMessages: Messages): Promise<void> {
  // Keep only the last 250 messages
  messages = newMessages.slice(-250);

  try {
    // Save to storage
    await storage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
    // Notify subscribers
    notifyMessageSubscribers();
  } catch (e) {
    error('Failed to save messages:', e);
  }
}

// Type for message change callback
type MessageChangeCallback = (messages: Messages) => void;
// Array to store subscribers
const messageSubscribers: MessageChangeCallback[] = [];

// Subscribe to message changes
export function subscribeToMessageChanges(callback: MessageChangeCallback): () => void {
  messageSubscribers.push(callback);

  // Call callback immediately with current messages
  callback([...messages]);

  // Return unsubscribe function
  return () => {
    const index = messageSubscribers.indexOf(callback);
    if (index !== -1) {
      messageSubscribers.splice(index, 1);
    }
  };
}

// Notify all subscribers of message changes
function notifyMessageSubscribers(): void {
  const messagesCopy = [...messages];
  messageSubscribers.forEach(callback => {
    try {
      callback(messagesCopy);
    } catch (e) {
      error('Error in message subscriber:', e);
    }
  });
}

// Initialize messages when module is imported
initMessages().catch(e => error('Failed to initialize messages:', e));