import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, Dimensions, View, ScrollView } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

const HEADER_HEIGHT = 250;
const { width } = Dimensions.get('window');
const IS_SMALL_SCREEN = width < 390;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
  headerBackgroundColor: { dark: string; light: string };
  headerGradient?: {
    light: { start: string; end: string };
    dark: { start: string; end: string };
  };
}>;

export default function ParallaxScrollView({
  children,
  headerImage,
  headerBackgroundColor,
  headerGradient,
}: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const scrollRef = useRef<ScrollView>(null);
  const bottom = useBottomTabOverflow();

  // Simple state to track scroll position
  const [scrollY, setScrollY] = useState(0);

  // Calculate header height based on screen size
  const headerHeight = IS_SMALL_SCREEN ? 180 : HEADER_HEIGHT;

  useEffect(() => {
    // Reset scroll position on mount
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: false });
    }
  }, []);

  // Determine background
  const renderHeaderBackground = () => {
    if (headerGradient) {
      const { start, end } = headerGradient[colorScheme];
      return (
        <LinearGradient
          colors={[start, end]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      );
    }
    return null;
  };

  // Simply calculate transform styles based on scroll position
  const headerStyle = {
    height: headerHeight,
    backgroundColor: !headerGradient ? headerBackgroundColor[colorScheme] : undefined,
    transform: [
      // Apply minimal transform for testing
      { translateY: scrollY * 0.5 }, // Move header at half the speed of scrolling
    ],
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        onScroll={(event) => {
          // Get scroll position
          const offsetY = event.nativeEvent.contentOffset.y;
          setScrollY(offsetY);
        }}
        contentContainerStyle={{ paddingBottom: bottom }}>

        {/* Fixed height container for header */}
        <View style={{ height: headerHeight, overflow: 'hidden' }}>
          {/* Header with background */}
          <View style={[styles.header, headerStyle]}>
            {renderHeaderBackground()}
          </View>

          {/* Image layer - separate from animation */}
          <View style={styles.headerImageContainer}>
            {headerImage}
          </View>
        </View>

        {/* Content */}
        <ThemedView style={styles.content}>{children}</ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    overflow: 'hidden',
  },
  headerImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10, // Keep image above the background
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});