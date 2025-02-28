import { FlashList } from '@shopify/flash-list';
import { useColorScheme, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { info, ItemProps, LOG } from '../utils/logger';

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

export default function Example() {
  const { top, bottom } = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isLight = scheme === 'light';

  useEffect(() => {
    info('Viewing log');
  }, []);

  return (
    <FlashList
      data={LOG}
      contentContainerStyle={{
        backgroundColor: !isLight ? "#000" : '#fff',
        paddingTop: top,
        paddingBottom: bottom
      }}
      renderItem={({ item }) => <Item {...item} />}
      estimatedItemSize={100}
    />
  );
}

