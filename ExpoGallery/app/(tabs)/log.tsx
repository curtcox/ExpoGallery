import { FlashList } from '@shopify/flash-list';
import { useColorScheme, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { info, ItemProps, subscribeToLogs } from '@/utils/logger';
import { ThemedText } from '@/components/ThemedText';

function Item({ index, timestamp, message, error }: ItemProps) {
  const scheme = useColorScheme();
  const color = scheme === 'light' ? "#000" : '#fff';
  const date = new Date(timestamp);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color, fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
        #{index}: {message}
      </Text>
      <Text style={{ color, opacity: 0.6 }}>
        {date.toLocaleTimeString()}
      </Text>
      {error && (
        <View style={{ marginTop: 8, padding: 8, backgroundColor: scheme === 'light' ? '#ffeeee' : '#442222', borderRadius: 8 }}>
          <Text style={{ color, fontFamily: 'monospace' }}>
            {typeof error === 'string' ? error : JSON.stringify(error, null, 2)}
          </Text>
        </View>
      )}
    </View>
  );
}

export default function LogScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  const [logEntries, setLogEntries] = useState<ItemProps[]>([]);

  useEffect(() => {
    info('Viewing log');

    // Subscribe to log updates
    const unsubscribe = subscribeToLogs(setLogEntries);

    // Clean up subscription on unmount
    return unsubscribe;
  }, []);

  return (
    <View>
      <ThemedText type="title">Log</ThemedText>
      <FlashList
        data={logEntries}
        contentContainerStyle={{
          backgroundColor: !isLight ? "#000" : '#fff',
          paddingTop: top,
          paddingBottom: bottom
        }}
        renderItem={({ item }) => <Item {...item} />}
        estimatedItemSize={100}
      />
    </View>
  );
}
