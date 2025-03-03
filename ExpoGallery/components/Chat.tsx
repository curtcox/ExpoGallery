import React from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';

// Define the interfaces to match those exported by the other Chat components
export interface IMessage {
  _id: string | number;
  text: string;
  createdAt: Date;
  user: {
    _id: number | string;
    name?: string;
    avatar?: string;
  };
  [key: string]: any;
}

export interface MessageTextProps {
  currentMessage?: IMessage;
  [key: string]: any;
}

// Simple message component to replace MessageText
export function MessageText(props: MessageTextProps) {
  const { currentMessage } = props;
  return (
    <View style={styles.messageContainer}>
      <Text style={styles.messageText}>{currentMessage?.text}</Text>
    </View>
  );
}

// Main Chat component
export default function Chat(props: {
  messages: IMessage[];
  onSend: (messages: IMessage[]) => void;
  user: { _id: number | string };
  renderMessageText?: (props: any) => React.ReactNode;
  [key: string]: any;
}) {
  const { messages, onSend, user, renderMessageText } = props;
  const [inputText, setInputText] = React.useState('');

  const handleSend = () => {
    if (inputText.trim().length === 0) return;

    const newMessage: IMessage = {
      _id: Math.round(Math.random() * 1000000),
      text: inputText,
      createdAt: new Date(),
      user: user,
    };

    onSend([newMessage]);
    setInputText('');
  };

  const renderMessage = ({ item }: { item: IMessage }) => {
    const isUser = item.user._id === user._id;

    const messageProps = {
      currentMessage: item,
    };

    return (
      <View style={[styles.messageRow, isUser ? styles.userMessageRow : styles.botMessageRow]}>
        {!isUser && item.user.avatar && (
          <View style={styles.avatar}>
            <Text>👤</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.userBubble : styles.botBubble]}>
          {renderMessageText ?
            renderMessageText({ ...messageProps }) :
            <MessageText {...messageProps} />
          }
          <Text style={styles.timestamp}>
            {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={80}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item._id.toString()}
          contentContainerStyle={styles.messagesContainer}
          inverted
        />
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            multiline
          />
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSend}
            disabled={inputText.trim().length === 0}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  messagesContainer: {
    flexGrow: 1,
    padding: 10,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 5,
  },
  userMessageRow: {
    justifyContent: 'flex-end',
  },
  botMessageRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 15,
  },
  userBubble: {
    backgroundColor: '#0084ff',
  },
  botBubble: {
    backgroundColor: '#e5e5ea',
  },
  messageContainer: {
    marginBottom: 2,
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
    backgroundColor: '#0084ff',
    borderRadius: 20,
  },
  sendButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});