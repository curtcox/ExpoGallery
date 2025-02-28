import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Link } from 'expo-router';
import { info } from '../../utils/logger';
import { Checkbox } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_EXAMPLES, FOCUSED_EXAMPLES_KEY, ExampleItem } from '@/utils/examples';

export default function GalleryScreen() {
  const [examples, setExamples] = useState<ExampleItem[]>(
    ALL_EXAMPLES.map(example => ({ ...example, selected: false }))
  );

  useEffect(() => {
    info('Viewing Gallery');

    // Load saved focused examples
    const loadFocusedExamples = async () => {
      try {
        const savedExamples = await AsyncStorage.getItem(FOCUSED_EXAMPLES_KEY);
        if (savedExamples) {
          const selectedNames = JSON.parse(savedExamples) as string[];
          setExamples(prev => prev.map(example => ({
            ...example,
            selected: selectedNames.includes(example.name)
          })));
        }
      } catch (error) {
        console.error('Failed to load focused examples:', error);
      }
    };

    loadFocusedExamples();
  }, []);

  const toggleExample = (index: number) => {
    const updatedExamples = [...examples];
    updatedExamples[index].selected = !updatedExamples[index].selected;
    setExamples(updatedExamples);

    // Save to AsyncStorage
    const selectedNames = updatedExamples
      .filter(example => example.selected)
      .map(example => example.name);

    AsyncStorage.setItem(FOCUSED_EXAMPLES_KEY, JSON.stringify(selectedNames))
      .catch(error => console.error('Failed to save focused examples:', error));
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      {examples.map((example, index) => (
        exampleRow(
          example.name,
          example.text,
          example.icon as any, // Type assertion to fix TypeScript error
          example.url,
          example.selected,
          () => toggleExample(index),
          index
        )
      ))}
    </ParallaxScrollView>
  );
}

function exampleRow(
  name: string,
  text: string,
  icon: any, // Changed type to any to fix TypeScript error
  url: string,
  selected: boolean,
  onToggle: () => void,
  key: number
) {
  const examplePage = `/${name}-example` as const; // Type assertion to fix TypeScript error
  const docUrl = url.startsWith('https') ? url : `https://docs.expo.dev/${url}` as const; // Type assertion to fix TypeScript error

  return (
    <View style={styles.linkRow} key={key}>
      <Checkbox
        status={selected ? 'checked' : 'unchecked'}
        onPress={onToggle}
      />
      <Ionicons name={icon} size={24} color="black" />
      <View style={styles.docsLinkContainer}>
        <Link href={docUrl}>Docs</Link>
      </View>
      <View style={styles.spacer} />
      <View style={styles.primaryLinkContainer}>
        <Link href={examplePage}>{text} Example</Link>
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
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
