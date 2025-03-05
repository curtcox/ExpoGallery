import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedRef,
  useAnimatedStyle,
  useScrollViewOffset,
  useSharedValue,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useColorScheme } from '@/hooks/useColorScheme';

const HEADER_HEIGHT = 250;
const { width } = Dimensions.get('window');
const IS_MOBILE = width < 768;
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
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollOffset = useScrollViewOffset(scrollRef);
  const bottom = useBottomTabOverflow();

  // Track if component is mounted and fully rendered
  const [isReady, setIsReady] = useState(false);
  // Force scroll to top on mount for consistency
  const initialOffset = useSharedValue(0);

  useEffect(() => {
    // Ensure header is properly positioned on mount
    const timer = setTimeout(() => {
      setIsReady(true);

      // Reset scroll position to ensure header is visible
      if (scrollRef.current) {
        scrollRef.current.scrollTo({ y: 0, animated: false });
      }
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Adjust animation based on screen size and device type
  const headerAnimatedStyle = useAnimatedStyle(() => {
    // Make animation less aggressive on smaller screens
    const translateFactor = IS_SMALL_SCREEN ? 0.4 : 0.75;
    const scaleFactor = IS_SMALL_SCREEN ? 1.5 : 2;

    // Use a smaller range for the animation on mobile
    const animationRange = IS_MOBILE ?
      [-HEADER_HEIGHT/2, 0, HEADER_HEIGHT/2] :
      [-HEADER_HEIGHT, 0, HEADER_HEIGHT];

    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            animationRange,
            [-HEADER_HEIGHT / 3, 0, HEADER_HEIGHT * translateFactor]
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            animationRange,
            [scaleFactor, 1, 1]
          ),
        },
      ],
      // Ensure header is initially visible
      opacity: isReady ? 1 : 0,
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

  // Use View wrapper to ensure header is rendered properly
  // even when scrolling happens during initial loading
  const headerHeight = IS_SMALL_SCREEN ? 180 : HEADER_HEIGHT;

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        ref={scrollRef}
        scrollEventThrottle={16}
        contentInsetAdjustmentBehavior="automatic"
        automaticallyAdjustContentInsets={false}
        scrollIndicatorInsets={{ bottom }}
        contentOffset={{ x: 0, y: initialOffset.value }}
        contentContainerStyle={{ paddingBottom: bottom }}
        onLayout={() => {
          // Make sure we're scrolled to top initially
          if (scrollRef.current) {
            scrollRef.current.scrollTo({ y: 0, animated: false });
          }
        }}>
        {/* Wrap header in regular View to ensure consistent rendering */}
        <View style={{ height: headerHeight, overflow: 'hidden' }}>
          <Animated.View
            style={[
              styles.header,
              { height: headerHeight },
              !headerGradient ? { backgroundColor: headerBackgroundColor[colorScheme] } : {},
              headerAnimatedStyle,
            ]}>
            {renderHeaderBackground()}
            <View style={styles.headerImageContainer}>
              {headerImage}
            </View>
          </Animated.View>
        </View>
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
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    overflow: 'hidden',
    zIndex: 10,
  },
  headerImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  content: {
    flex: 1,
    padding: 32,
    gap: 16,
    overflow: 'hidden',
  },
});