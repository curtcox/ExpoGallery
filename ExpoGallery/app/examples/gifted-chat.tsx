import React, { useState, useCallback, useEffect } from 'react'
import GiftedChat from '@/components/Chat';
import { IMessage } from '@/components/Chat';

export default function Example() {
  const [messages, setMessages] = useState<IMessage[]>([])

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: 'Hello developer',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'React Native',
          avatar: 'https://placeimg.com/140/140/any',
        },
      },
    ])
  }, [])

  // Function to generate a bot response
  const generateBotResponse = useCallback((userMessage: string) => {
    // Create a bot response by adding a question mark
    // This could be replaced with an HTTP request in the future
    const botResponse: IMessage = {
      _id: Math.round(Math.random() * 1000000),
      text: `${userMessage}?`,
      createdAt: new Date(),
      user: {
        _id: 2,
        name: 'React Native',
        avatar: 'https://placeimg.com/140/140/any',
      },
    };

    return botResponse;
  }, []);

  const onSend = useCallback((messages: IMessage[] = []) => {
    setMessages(previousMessages =>
      GiftedChat.append(previousMessages, messages),
    )

    // Generate a response to the user's message
    if (messages.length > 0) {
      const userMessage = messages[0].text;

      // Add a small delay to make it feel more natural
      setTimeout(() => {
        const botResponse = generateBotResponse(userMessage);
        setMessages(previousMessages =>
          GiftedChat.append(previousMessages, [botResponse]),
        );
      }, 1000);
    }
  }, [generateBotResponse])

  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: 1,
      }}
    />
  )
}