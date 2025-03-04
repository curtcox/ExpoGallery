import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { info } from '@/utils/logger';
import { subscribeToSettingsChanges, currentSettings } from '@/storage/settings';
import { ALL_EXAMPLES, ExampleItem } from '@/utils/examples';
import { ThemedScrollView } from '@/components/ThemedScrollView';


export default function FocusScreen() {
  const [focusedExamples, setFocusedExamples] = useState<ExampleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    info('Viewing Focus Screen');

    const loadFocusedExamples = () => {
      try {
        setIsLoading(true);
        const settings = currentSettings();
        const selectedNames = settings.focusedExamples || [];

        // Filter to get only the selected examples
        const selected = ALL_EXAMPLES.filter(example =>
          selectedNames.includes(example.name)
        );

        setFocusedExamples(selected);
      } catch (error) {
        console.error('Failed to load focused examples:', error);
        setFocusedExamples([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFocusedExamples();

    // Subscribe to settings changes
    const unsubscribe = subscribeToSettingsChanges(() => {
      loadFocusedExamples();
    });

    return () => unsubscribe();
  }, []);

  return (
    <ThemedScrollView>
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
    </ThemedScrollView>
  );
}

function exampleRow(name: string, text: string, icon: any, url: string, key: number) {
  const examplePage = `/${name}-example`;
  const docUrl = url.startsWith('https') ? url : `https://docs.expo.dev/${url}`;

  return (
    <View style={styles.linkRow} key={key}>
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
  message: {
    padding: 20,
    fontSize: 16,
    textAlign: 'center',
  },
});
