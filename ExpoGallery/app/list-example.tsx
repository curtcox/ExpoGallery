import { FlashList } from '@shopify/flash-list';
import { useColorScheme, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DATA = Array(1000)
  .fill(0)
  .map((_, v) => ({ index: v }));

interface ItemProps {
  index: number;
}

function Item({ index }: ItemProps) {
  const scheme = useColorScheme();
  const color = scheme === 'light' ? "#000" : '#fff';
  const beforeNumbers = Array.from({ length: 5 }, (_, i) => index - 5 + i);
  const afterNumbers  = Array.from({ length: 5 }, (_, i) => index + i + 1);

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ color, fontSize: 18, fontWeight: "bold", marginBottom: 8 }}>
        Current: {index}
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={{ color, opacity: 0.6, marginBottom: 4 }}>Before:</Text>
          <Text style={{ color, fontSize: 14 }}>
            {beforeNumbers.join(', ')}
          </Text>
        </View>
        <View>
          <Text style={{ color, opacity: 0.6, marginBottom: 4 }}>After:</Text>
          <Text style={{ color, fontSize: 14 }}>
            {afterNumbers.join(', ')}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const { top, bottom } = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isLight = scheme === 'light';
  
  return (
    <FlashList
      data={DATA}
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
