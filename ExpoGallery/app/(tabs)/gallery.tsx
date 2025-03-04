import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { info } from '../../utils/logger';
import { Checkbox } from 'react-native-paper';
import { ALL_EXAMPLES, ExampleItem } from '@/utils/examples';
import { subscribeToSettingsChanges, updateSettings, currentSettings } from '@/storage/settings';
import { ThemedScrollView } from '@/components/ThemedScrollView';

export default function GalleryScreen() {
  const [examples, setExamples] = useState<ExampleItem[]>(
    ALL_EXAMPLES.map(example => ({ ...example, selected: false }))
  );

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

  return (
    <ThemedScrollView>
      {examples.map((example, index) => (
        exampleRow(
          example.name,
          example.text,
          example.icon as any,
          example.url,
          example.selected ?? false,
          () => toggleExample(index),
          index
        )
      ))}
    </ThemedScrollView>
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
      <Checkbox
        status={selected ? 'checked' : 'unchecked'}
        onPress={onToggle}
      />
      <Ionicons name={icon} size={24} color="black" />
      <View style={styles.docsLinkContainer}>
        <Link href={docUrl as any}>Docs</Link>
      </View>
      <View style={styles.spacer} />
      <View style={styles.primaryLinkContainer}>
        <Link href={examplePage as any}>{text} Example</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docsLinkContainer: {
    marginLeft: 20, // Adjusted to make room for checkbox
  },
  spacer: {
    flex: 1,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
