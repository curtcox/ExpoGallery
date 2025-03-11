import { error, storage, info } from '@/utils/index';
import { IMessage } from 'react-native-gifted-chat';
import { Platform } from 'react-native';

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
  info(`Initializing messages from storage. Platform: ${Platform.OS}`);
  try {
    info('Attempting to retrieve messages from storage');
    const storedMessages = await storage.getItem(MESSAGES_STORAGE_KEY);
    if (storedMessages) {
      info(`Retrieved stored messages, length: ${storedMessages.length} characters`);
      const parsedMessages = JSON.parse(storedMessages);
      messages = parsedMessages;
      info(`Parsed ${messages.length} messages from storage`);
    } else {
      info('No messages found in storage');
    }
  } catch (e) {
    error('Failed to load messages:', e);
  }
}

// Update messages with new values
export async function updateMessages(newMessages: Messages): Promise<void> {
  info(`Updating messages. New count: ${newMessages.length}`);
  // Keep only the last 250 messages
  messages = newMessages.slice(-250);

  try {
    // Save to storage
    const jsonMessages = JSON.stringify(messages);
    info(`Saving messages to storage. JSON length: ${jsonMessages.length} characters`);
    await storage.setItem(MESSAGES_STORAGE_KEY, jsonMessages);
    info('Messages successfully saved to storage');
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
  info('New subscriber added to message changes');
  messageSubscribers.push(callback);

  // Call callback immediately with current messages
  info(`Calling callback with ${messages.length} current messages`);
  callback([...messages]);

  // Return unsubscribe function
  return () => {
    const index = messageSubscribers.indexOf(callback);
    if (index !== -1) {
      messageSubscribers.splice(index, 1);
      info('Subscriber removed from message changes');
    }
  };
}

// Notify all subscribers of message changes
function notifyMessageSubscribers(): void {
  const messagesCopy = [...messages];
  info(`Notifying ${messageSubscribers.length} subscribers of message changes`);
  messageSubscribers.forEach(callback => {
    try {
      callback(messagesCopy);
    } catch (e) {
      error('Error in message subscriber:', e);
    }
  });
}

// Initialize messages when module is imported
info('Messages module loaded, initializing...');
initMessages().catch(e => error('Failed to initialize messages:', e));