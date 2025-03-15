import { StyleSheet, View, Text, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { info } from '../../utils/logger';
import { Checkbox } from 'react-native-paper';
import { ALL_EXAMPLES, ExampleItem } from '@/utils/examples';
import { subscribeToSettingsChanges, updateSettings, currentSettings } from '@/storage/settings';
import { FlashList } from '@shopify/flash-list';

export default function GalleryScreen() {
  const [examples, setExamples] = useState<ExampleItem[]>(
    ALL_EXAMPLES.map(example => ({ ...example, selected: false }))
  );
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    info('Viewing Gallery');

    // Load saved focused examples from settings
    const loadFocusedExamples = () => {
      const settings = currentSettings();
      const selectedNames = settings.focusedExamples || [];

      setExamples(prev => prev.map(example => ({
        ...example,
        selected: selectedNames.includes(example.name)
      })));
    };

    loadFocusedExamples();

    // Subscribe to settings changes
    const unsubscribe = subscribeToSettingsChanges((settings) => {
      const selectedNames = settings.focusedExamples || [];
      setExamples(prev => prev.map(example => ({
        ...example,
        selected: selectedNames.includes(example.name)
      })));
    });

    return () => unsubscribe();
  }, []);

  const toggleExample = (index: number) => {
    const updatedExamples = [...examples];
    updatedExamples[index].selected = !updatedExamples[index].selected;
    setExamples(updatedExamples);

    // Save to settings
    const selectedNames = updatedExamples
      .filter(example => example.selected)
      .map(example => example.name);

    updateSettings({ focusedExamples: selectedNames })
      .catch(error => console.error('Failed to save focused examples:', error));
  };

  const renderItem = ({ item, index }: { item: ExampleItem; index: number }) => {
    return exampleRow(
      item.name,
      item.text,
      item.icon as any,
      item.url,
      item.selected ?? false,
      () => toggleExample(index),
      index
    );
  };

  // Filter examples based on search term
  const filteredExamples = examples.filter(example =>
    example.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    example.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search examples..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          clearButtonMode="while-editing"
        />
      </View>
      <FlashList
        data={filteredExamples}
        renderItem={renderItem}
        estimatedItemSize={60}
        keyExtractor={(item) => item.name}
      />
    </View>
  );
}

function exampleRow(
  name: string,
  text: string,
  icon: any,
  url: string,
  selected: boolean,
  onToggle: () => void,
  key: number
) {
  const examplePage = `/${name}-example`;
  const docUrl = url.startsWith('https') ? url : `https://docs.expo.dev/${url}`;

  return (
    <View style={styles.linkRow} key={key}>
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={selected ? 'checked' : 'unchecked'}
          onPress={onToggle}
        />
      </View>
      <Ionicons name={icon} size={24} color="black" style={styles.icon} />
      <View style={styles.docsLinkContainer}>
        <Link href={docUrl as any} style={styles.docsLink}>Docs</Link>
      </View>
      <View style={styles.primaryLinkContainer}>
        <Link href={examplePage as any} style={styles.primaryLink}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.linkText}>
            {text}
          </Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  checkboxContainer: {
    marginRight: 0,
    paddingRight: 0,
  },
  icon: {
    marginLeft: 8,
    width: 24,
  },
  docsLinkContainer: {
    marginLeft: 12,
    width: 50,
  },
  docsLink: {
    fontSize: 14,
  },
  primaryLinkContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-end',
  },
  primaryLink: {
    maxWidth: '100%',
  },
  linkText: {
    fontSize: 14,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
