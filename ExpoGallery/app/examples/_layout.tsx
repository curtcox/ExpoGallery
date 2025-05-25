import { Slot, useLocalSearchParams, Link, usePathname, useSegments } from 'expo-router';
import React, { useMemo } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ALL_EXAMPLES } from './examples';

export default function ExampleLayout() {
  const params = useLocalSearchParams();
  const exampleName = params.screen as string;
  const path = usePathname();
  const segments = useSegments();

  const currentExample = useMemo(() => {
    return ALL_EXAMPLES.find(example => example.name === exampleName || example.name === segments[segments.length - 1]);
  }, [exampleName, segments]);

  if (!currentExample) {
    return (
      <>
        <Text>Example not found on {path}</Text>
        <Text>Name {exampleName}</Text>
        <Text>Params {JSON.stringify(params)}</Text>
        <Text>Segments {JSON.stringify(segments)}</Text>
        <Slot />
      </>
    );
  }

  const docUrl = currentExample.url.startsWith('https')
    ? currentExample.url
    : `https://docs.expo.dev/${currentExample.url}`;

  const srcUrl = `https://github.com/curtcox/ExpoGallery/blob/main/ExpoGallery/app/examples/${currentExample.name}.tsx`;

  return (
    <>
      <View style={styles.header}>
        <Ionicons name={currentExample.icon as any} size={24} color="black" style={styles.icon} />
        <Text style={styles.title}>{currentExample.text}</Text>
      </View>
      <Slot />
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Link href={docUrl as any} style={styles.link}>Documentation</Link>
          <Link href={srcUrl as any} style={styles.link}>Source</Link>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  icon: {
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
  },
  link: {
    color: '#3498db',
    fontSize: 16,
  }
});
