import { FlashList } from '@shopify/flash-list';
import { useColorScheme, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { info, ItemProps, subscribeToLogs } from '@/utils/logger';
import { ThemedText } from '@/components/ThemedText';

function Item({ index, timestamp, message, level, error }: ItemProps) {
  const scheme = useColorScheme();
  const color = scheme === 'light' ? "#000" : '#fff';
  const date = new Date(timestamp);

  // Define colors for each log level
  const levelColors = {
    info: '#4caf50',
    warn: '#ff9800',
    error: '#f44336'
  };

  return (
    <View style={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <View style={{
          backgroundColor: levelColors[level],
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 4,
          marginRight: 8
        }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
            {level.toUpperCase()}
          </Text>
        </View>
        <Text style={{ color, fontSize: 18, fontWeight: "bold", flex: 1 }}>
          #{index}: {message}
        </Text>
      </View>
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
  const [filters, setFilters] = useState({
    info: true,
    warn: true,
    error: true
  });

  // Filter logs based on selected levels
  const filteredLogs = logEntries.filter(entry => filters[entry.level]);

  // Calculate counts of each log type in a single pass
  const counts = logEntries.reduce((acc, entry) => {
    acc[entry.level]++;
    return acc;
  }, {
    info: 0,
    warn: 0,
    error: 0
  });

  useEffect(() => {
    info('Viewing log');

    // Subscribe to log updates
    const unsubscribe = subscribeToLogs(setLogEntries);

    // Clean up subscription on unmount
    return unsubscribe;
  }, []);

  const toggleFilter = (level: 'info' | 'warn' | 'error') => {
    setFilters(prev => ({
      ...prev,
      [level]: !prev[level]
    }));
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedText type="title">Log</ThemedText>

      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        backgroundColor: isLight ? '#f0f0f0' : '#222'
      }}>
        <FilterCheckbox
          label="Info"
          count={counts.info}
          value={filters.info}
          onValueChange={() => toggleFilter('info')}
          color="#4caf50"
          isLight={isLight}
        />
        <FilterCheckbox
          label="Warning"
          count={counts.warn}
          value={filters.warn}
          onValueChange={() => toggleFilter('warn')}
          color="#ff9800"
          isLight={isLight}
        />
        <FilterCheckbox
          label="Error"
          count={counts.error}
          value={filters.error}
          onValueChange={() => toggleFilter('error')}
          color="#f44336"
          isLight={isLight}
        />
      </View>

      <FlashList
        data={filteredLogs}
        contentContainerStyle={{
          backgroundColor: !isLight ? "#000" : '#fff',
          paddingTop: top,
          paddingBottom: bottom
        }}
        renderItem={({ item }) => <Item {...item} />}
        estimatedItemSize={100}
      />
    </SafeAreaView>
  );
}

interface FilterCheckboxProps {
  label: string;
  count: number;
  value: boolean;
  onValueChange: () => void;
  color: string;
  isLight: boolean;
}

function FilterCheckbox({ label, count, value, onValueChange, color, isLight }: FilterCheckboxProps) {
  return (
    <TouchableOpacity
      onPress={onValueChange}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          borderWidth: 2,
          borderColor: color,
          backgroundColor: value ? color : 'transparent',
          marginRight: 8,
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        {value && (
          <Text style={{ color: 'white', fontSize: 14, fontWeight: 'bold' }}>✓</Text>
        )}
      </View>
      <Text style={{ color: isLight ? '#000' : '#fff' }}>
        {label}{' '}
        <Text style={{
          fontWeight: 'bold',
          color: value ? color : isLight ? '#666' : '#999'
        }}>
          ({count})
        </Text>
      </Text>
    </TouchableOpacity>
  );
}
