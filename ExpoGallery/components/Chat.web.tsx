import React from 'react';
import { GiftedChat, IMessage, MessageTextProps, MessageText } from 'react-native-gifted-chat';

// Re-export the GiftedChat types for use in other components
export type { IMessage, MessageTextProps };
export { MessageText };

// Web-specific Chat component that can be customized for web
export default function Chat(props: React.ComponentProps<typeof GiftedChat>) {
  // For now, we're just using GiftedChat directly for web
  return <GiftedChat {...props} />;
}

// Add the append method to the Chat component to match the native implementation
Chat.append = GiftedChat.append;