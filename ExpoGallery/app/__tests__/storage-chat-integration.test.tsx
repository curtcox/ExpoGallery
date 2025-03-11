import React from 'react';
import { render, act } from '@testing-library/react-native';
import ChatScreen from '../(tabs)/chat';
import { subscribeToMessageChanges, updateMessages } from '@/storage/messages';
import * as storage from '@/utils/storage';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

jest.mock('@/storage/messages', () => ({
  subscribeToMessageChanges: jest.fn(),
  updateMessages: jest.fn(),
}));

jest.mock('@/services/chat', () => ({
  generateBotResponse: jest.fn(),
}));

jest.mock('@/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
}));

// Mock GiftedChat
jest.mock('@/components/Chat', () => {
  const React = require('react');
  const mockGiftedChat = ({ messages, onSend }) => (
    <div data-testid="gifted-chat" />
  );
  mockGiftedChat.append = jest.fn((oldMessages, newMessages) => [
    ...newMessages,
    ...oldMessages,
  ]);
  return {
    __esModule: true,
    default: mockGiftedChat,
    MessageText: () => <div data-testid="message-text" />,
  };
});

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

    // Mock the subscription callback
    subscribeToMessageChanges.mockImplementation((callback) => {
      // Call the callback immediately with mock data
      callback(mockMessages);
      // Return an unsubscribe function
      return jest.fn();
    });

    // Render the component
    await act(async () => {
      render(<ChatScreen />);
    });

    // Verify the subscription was called
    expect(subscribeToMessageChanges).toHaveBeenCalledTimes(1);
  });

  it('should handle storage access restriction errors', async () => {
    // Mock the storage module to simulate an error
    const originalGetItem = storage.storage.getItem;
    const originalSetItem = storage.storage.setItem;

    // Create spy to verify the error is caught properly
    const getItemSpy = jest.spyOn(storage.storage, 'getItem')
      .mockRejectedValue(new Error('Access to storage is not allowed from this context'));

    const setItemSpy = jest.spyOn(storage.storage, 'setItem')
      .mockRejectedValue(new Error('Access to storage is not allowed from this context'));

    // Mock the subscription callback
    subscribeToMessageChanges.mockImplementation((callback) => {
      // Call the callback with empty messages to trigger welcome message creation
      callback([]);
      // Return an unsubscribe function
      return jest.fn();
    });

    // Render the component
    await act(async () => {
      render(<ChatScreen />);
    });

    // Verify the subscription was called
    expect(subscribeToMessageChanges).toHaveBeenCalledTimes(1);

    // Verify updateMessages was called (this would use our mocked storage)
    expect(updateMessages).toHaveBeenCalledTimes(1);

    // Restore the original functions
    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });

  it('should gracefully handle other storage errors', async () => {
    // Mock the storage module to simulate a generic error
    const getItemSpy = jest.spyOn(storage.storage, 'getItem')
      .mockRejectedValue(new Error('Generic storage error'));

    // Mock the subscription callback
    subscribeToMessageChanges.mockImplementation((callback) => {
      // Call the callback with empty messages to trigger welcome message creation
      callback([]);
      // Return an unsubscribe function
      return jest.fn();
    });

    // Render the component
    await act(async () => {
      render(<ChatScreen />);
    });

    // Verify error handling works without crashing
    expect(subscribeToMessageChanges).toHaveBeenCalledTimes(1);

    // Restore the original function
    getItemSpy.mockRestore();
  });
});