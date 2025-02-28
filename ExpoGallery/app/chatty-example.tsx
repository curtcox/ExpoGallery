import dayjs from "dayjs";
import * as React from "react";
import { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  AppRegistry,
  Image,
  Platform,
  TouchableOpacity,
  Text,
} from "react-native";
import { ChatEmitter, Chatty } from "react-native-chatty";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import {
  initialWindowMetrics,
  SafeAreaProvider,
} from "react-native-safe-area-context";

export default function Example() {
  const listRef = useRef(null);
  const message = useRef();
  const [replying, setReplying] = React.useState(null);
  const [messages, setMessages] = React.useState([
    {
      id: 1,
      text: "Hello!",
      me: true,
      createdAt: new Date(),
      user: {
        id: 1,
        username: "John Doe",
        avatar: { uri: "https://i.pravatar.cc/300" },
      },
    },
    {
      id: 2,
      text: "Hello john! how are you?",
      me: false,
      createdAt: new Date(),
      user: {
        id: 2,
        username: "Jane Doe",
        avatar: { uri: "https://i.pravatar.cc/300" },
      },
      repliedTo: {
        id: 1,
        text: "Hello!",
        me: true,
        createdAt: new Date(),
        user: {
          id: 1,
          username: "John Doe",
          avatar: { uri: "https://i.pravatar.cc/300" },
        },
      },
    },
    {
      id: 8,
      text: "I'm fine thanks! What about you?",
      me: true,
      createdAt: new Date(),
      user: {
        id: 2,
        username: "Jane Doe",
        avatar: { uri: "https://i.pravatar.cc/300" },
      },
    },
  ]);

  useEffect(() => {
    ChatEmitter?.addListener("patternPressed", (pattern) => {
      Alert.alert("Pattern pressed", pattern);
    });

    const _messages = [];

    for (let index = 0; index < 21; index++) {
      _messages.push({
        id: index * 10,
        text: "Hello! " +index,
        me: Math.floor(Math.random() * 2) === 1 ? true : false,
        createdAt: new Date(),
        user: {
          id: index * 10,
          username: "Jane Doe",
          avatar: { uri: "https://i.pravatar.cc/300" },
        }
      });
    }

    setMessages([...messages, ..._messages]);

    return () => {
      ChatEmitter.removeAllListeners();
    };
  }, []);

  const onLoadEarlier = () => {
    return new Promise((resolve) => {
      setMessages((prev) => [
        ...[
          {
            id: 1203,
            text: "I'm loaded!",
            me: true,
            createdAt: dayjs().add(-5, "day").toDate(),
            user: {
              id: 1,
              username: "John Doe",
              avatar: { uri: "https://i.pravatar.cc/300" },
            },
          },
        ],
        ...prev,
      ]);

      setTimeout(() => {
        resolve(true);
      }, 300);
    });
  };

  const onPressSend = React.useCallback(
    ({ text, repliedTo }: { text: string; repliedTo?: any }) => {
      if (listRef.current) {
        listRef.current.appendMessage({
          id: messages.length + 1,
          text,
          me: Math.floor(Math.random() * 2) === 0,
          createdAt: new Date(),
          user: {
            id: messages.length + 1,
            name: "Jane Doe",
            avatar: { uri: "https://i.pravatar.cc/300" },
          },
          repliedTo,
        });

        listRef.current.setIsTyping(false);
      }
      setReplying(null);
    },
    [messages],
  );

  const onChangeText = React.useCallback((text: string) => {
    console.log(text);
    message.current = text;
    //@ts-ignore
    listRef.current?.setIsTyping(text.length > 0);
  }, []);

  const onPressLike = React.useCallback(() => {
    if (Platform.OS === "web")
      return alert("Liked a message (Custom logic and view)");
    Alert.alert("Liked a message (Custom logic and view)");
  }, []);

  if (messages.length < 1) return <ActivityIndicator />;

  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      <GestureHandlerRootView>
        <Chatty
          enableHapticFeedback
          messages={messages}
          ref={listRef}
          enablePatterns
          patternProps={{
            allowPatterns: ["mention"],
          }}
          showScrollToBottomButton
          bubbleProps={{
            trailingAccessory: (
              <TouchableOpacity onPress={onPressLike}>
                <Image
                  style={{
                    width: 20,
                    height: 20,
                  }}
                  source={{
                    uri: "https://i.imgur.com/BT8D542.png",
                  }}
                />
              </TouchableOpacity>
            ),
            replyDragElement: (
              <Image
                source={{
                  uri: "https://icon-library.com/images/reply-icon-png/reply-icon-png-16.jpg",
                }}
                style={{ width: 30, height: 30 }}
              />
            ),
          }}
          footerProps={{
            onPressSend: onPressSend,
            onPressCancelReply: () => setReplying(null),
            onChangeText: onChangeText,
          }}
          loadEarlierProps={{
            onLoadEarlier: onLoadEarlier,
            show: messages.length === 10 ? false : true,
          }}
          onReply={(message) => {
            setReplying(message as any);
          }}
          renderTypingBubble={() => <Text>Custom View (Typing...)</Text>}
          replyingTo={replying ?? undefined}
          headerProps={{
            user: {
              id: 0,
              username: "John Doe",
              avatar: { uri: "https://i.pravatar.cc/300" },
            },
          }}
        />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}

AppRegistry.registerComponent("chatty", () => Example);
