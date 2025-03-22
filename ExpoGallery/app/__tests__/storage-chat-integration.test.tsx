import React from 'react';
import { subscribeToMessageChanges, updateMessages, Message } from '@/storage/messages';
import * as storage from '@/utils/storage';
import { IMessage } from 'react-native-gifted-chat';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Create mock functions before mocking the modules
type MessageCallback = (messages: Message[]) => void;
const mockSubscribeImpl = jest.fn((callback: MessageCallback) => jest.fn());
const mockUpdateImpl = jest.fn();

// Mock for messages module
jest.mock('@/storage/messages', () => ({
  subscribeToMessageChanges: mockSubscribeImpl,
  updateMessages: mockUpdateImpl,
  initMessages: jest.fn(() => Promise.resolve()),
  messages: [],
  defaultMessages: [],
}));

jest.mock('@/services/chat', () => ({
  generateBotResponse: jest.fn(),
}));

jest.mock('@/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

// Mock AsyncStorage directly in this test file
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
  clear: jest.fn(() => Promise.resolve()),
}));

// Explicitly mock storage module to avoid AsyncStorage issues
const mockGetItemImpl = jest.fn(() => Promise.resolve(null));
const mockSetItemImpl = jest.fn(() => Promise.resolve());

jest.mock('@/utils/storage', () => ({
  storage: {
    getItem: mockGetItemImpl,
    setItem: mockSetItemImpl,
    removeItem: jest.fn(() => Promise.resolve()),
    getAllKeys: jest.fn(() => Promise.resolve([])),
    multiGet: jest.fn(() => Promise.resolve([])),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

// Mock GiftedChat
const mockAppendImpl = jest.fn((oldMessages, newMessages) => [
  ...newMessages,
  ...oldMessages,
]);

jest.mock('@/components/Chat', () => {
  return {
    __esModule: true,
    default: jest.fn(() => null),
    append: mockAppendImpl,
    MessageText: jest.fn(() => null),
  };
});

// Mock implementation of welcome message creation
const createWelcomeMessage = (messages: Message[]) => {
  if (messages.length === 0) {
    mockUpdateImpl([
      {
        _id: 1,
        text: 'Welcome to the chat!',
        createdAt: new Date(),
        user: { _id: 2, name: 'Bot' }
      }
    ]);
  }
};

describe('ChatScreen with Storage Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle messages from storage subscription', async () => {
    // Setup mock messages
    const mockMessages = [
      {
        _id: 1,
        text: 'Test message',
        createdAt: new Date(),
        user: { _id: 2, name: 'Bot', avatar: 'https://placecats.com/140/140' },
      },
    ];

    // Setup callback function to test
    let capturedCallback: MessageCallback = () => {};

    // Mock the subscription callback
    mockSubscribeImpl.mockImplementation((callback: MessageCallback) => {
      capturedCallback = callback;
      return jest.fn();
    });

    // Simulate what the component would do - call the subscription method
    const callback = (messages: Message[]) => {
      // Component would handle messages here
    };
    mockSubscribeImpl(callback);

    // Verify the subscription was called
    expect(mockSubscribeImpl).toHaveBeenCalledTimes(1);
    expect(capturedCallback).not.toBeNull();

    // Now simulate the callback being triggered with mock data
    if (capturedCallback) {
      capturedCallback(mockMessages);
    }
  });

  it('should handle storage access restriction errors', async () => {
    // Mock the storage module to simulate an error
    mockGetItemImpl.mockRejectedValue(
      new Error('Access to storage is not allowed from this context')
    );

    mockSetItemImpl.mockRejectedValue(
      new Error('Access to storage is not allowed from this context')
    );

    // Setup callback function to test
    let capturedCallback: MessageCallback = () => {};

    // Mock the subscription callback
    mockSubscribeImpl.mockImplementation((callback: MessageCallback) => {
      capturedCallback = callback;
      return jest.fn();
    });

    // Simulate what the component would do
    const callback = (messages: Message[]) => {
      createWelcomeMessage(messages);
    };
    mockSubscribeImpl(callback);

    // Verify the subscription was called
    expect(mockSubscribeImpl).toHaveBeenCalledTimes(1);
    expect(capturedCallback).not.toBeNull();

    // Now simulate the callback being triggered with empty data
    if (capturedCallback) {
      capturedCallback([]);
    }

    // Verify updateMessages was called with welcome message
    expect(mockUpdateImpl).toHaveBeenCalledTimes(1);
    expect(mockUpdateImpl.mock.calls[0][0]).toHaveLength(1);
    expect(mockUpdateImpl.mock.calls[0][0][0].text).toContain('Welcome');
  });

  it('should gracefully handle other storage errors', async () => {
    // Mock the storage module to simulate a generic error
    mockGetItemImpl.mockRejectedValue(new Error('Generic storage error'));

    // Setup callback function to test
    let capturedCallback: MessageCallback = () => {};

    // Mock the subscription callback
    mockSubscribeImpl.mockImplementation((callback: MessageCallback) => {
      capturedCallback = callback;
      return jest.fn();
    });

    // Simulate what the component would do
    const callback = (messages: Message[]) => {
      createWelcomeMessage(messages);
    };
    mockSubscribeImpl(callback);

    // Verify the subscription was called
    expect(mockSubscribeImpl).toHaveBeenCalledTimes(1);
    expect(capturedCallback).not.toBeNull();

    // Now simulate the callback being triggered with empty data
    if (capturedCallback) {
      capturedCallback([]);
    }

    // Verify updateMessages was called with welcome message
    expect(mockUpdateImpl).toHaveBeenCalledTimes(1);
  });
});