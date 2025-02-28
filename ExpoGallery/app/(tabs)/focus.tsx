import { Image, StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Link } from 'expo-router';
import { info } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALL_EXAMPLES, FOCUSED_EXAMPLES_KEY, ExampleItem } from '@/utils/examples';

export default function FocusScreen() {
  const [focusedExamples, setFocusedExamples] = useState<ExampleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    info('Viewing Focus Screen');

    const loadFocusedExamples = async () => {
      try {
        setIsLoading(true);
        const savedExampleNames = await AsyncStorage.getItem(FOCUSED_EXAMPLES_KEY);

        if (savedExampleNames) {
          const selectedNames = JSON.parse(savedExampleNames) as string[];

          // Filter to get only the selected examples
          const selected = ALL_EXAMPLES.filter(example =>
            selectedNames.includes(example.name)
          );

          setFocusedExamples(selected);
        } else {
          setFocusedExamples([]);
        }
      } catch (error) {
        console.error('Failed to load focused examples:', error);
        setFocusedExamples([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFocusedExamples();
  }, []);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      {isLoading ? (
        <Text style={styles.message}>Loading your focused examples...</Text>
      ) : focusedExamples.length === 0 ? (
        <Text style={styles.message}>
          No examples selected. Go to the Gallery tab and check some examples to add them here.
        </Text>
      ) : (
        focusedExamples.map((example, index) =>
          exampleRow(example.name, example.text, example.icon as any, example.url, index)
        )
      )}
    </ParallaxScrollView>
  );
}

function exampleRow(name: string, text: string, icon: any, url: string, key: number) {
  const examplePage = `/${name}-example` as const; // Type assertion to fix TypeScript error
  const docUrl = url.startsWith('https') ? url : `https://docs.expo.dev/${url}` as const; // Type assertion to fix TypeScript error

  return (
    <View style={styles.linkRow} key={key}>
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
    marginLeft: 50,
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
  message: {
    padding: 20,
    fontSize: 16,
    textAlign: 'center',
  },
});
