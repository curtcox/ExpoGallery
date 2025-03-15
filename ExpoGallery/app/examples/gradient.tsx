import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { ThemedScrollView } from '@/components/ThemedScrollView';
import { ThemedView } from '@/components/ThemedView';

export default function Example() {
  return (
    <ThemedScrollView
      headerGradient={{
        light: {
          start: '#BFEEBF', // Top color for light mode
          end: '#4AA96C'    // Bottom color for light mode
        },
        dark: {
          start: '#1D3D47', // Top color for dark mode
          end: '#0A1A1F'    // Bottom color for dark mode
        }
      }}
    >
      <ThemedView style={styles.container}>
        <Text style={styles.title}>Gradient Background Example</Text>
        <Text style={styles.paragraph}>
          This example demonstrates the ThemedScrollView component with a gradient background that blends from one color at the top to another at the bottom.
        </Text>
        <Text style={styles.paragraph}>
          The gradient colors are customizable for both light and dark mode, with a smooth transition between them.
        </Text>
        <Text style={styles.paragraph}>
          You can test the gradient display on different devices and screen sizes to see how it adapts.
        </Text>
        <Text style={styles.paragraph}>
          The LinearGradient component from expo-linear-gradient is used to create the blended background effect.
        </Text>
      </ThemedView>
    </ThemedScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
  },
});