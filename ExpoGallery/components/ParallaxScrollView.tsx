import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

// Make header height responsive based on screen width
const { width } = Dimensions.get('window');
const IS_SMALL_SCREEN = width < 390; // iPhone SE, mini, etc.
const BASE_HEADER_HEIGHT = 250;
const HEADER_HEIGHT = IS_SMALL_SCREEN ? 180 : BASE_HEADER_HEIGHT;

// Adjust animation factors for smaller screens
const getAnimationFactors = () => {
  // Less aggressive animation on small screens
  if (IS_SMALL_SCREEN) {
    return {
      translateFactor: 0.4, // Reduced from 0.75
      minScale: 1.5, // Reduced from 2
    };
  }

  return {
    translateFactor: 0.75,
    minScale: 2,
  };
};

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
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();
  const { translateFactor, minScale } = getAnimationFactors();

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 3, 0, HEADER_HEIGHT * translateFactor]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [minScale, 1, 1]
          ),
        },
      ],
    };
  });

  // Determine whether to use gradient or solid background
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

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}>
        <Animated.View
          style={[
            styles.header,
            // Only apply backgroundColor if not using gradient
            !headerGradient ? { backgroundColor: headerBackgroundColor[colorScheme] } : {},
            headerAnimatedStyle,
            { height: HEADER_HEIGHT }, // Apply dynamic height
          ]}>
          {renderHeaderBackground()}
          {headerImage}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    overflow: 'hidden',
    // Height is now set dynamically in the component
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});