import React, { ReactElement, ReactNode, useState, useRef } from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, ImageStyle, View, TouchableWithoutFeedback } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { router } from 'expo-router';

const DEFAULT_HEADER_IMAGE = require('@/assets/images/logo.png');

type ThemedScrollViewProps = {
  children: ReactNode;
  headerBackgroundColor?: { light: string; dark: string };
  headerGradient?: {
    light: { start: string; end: string };
    dark: { start: string; end: string };
  };
  headerImage?: ReactElement;
  headerImageSource?: ImageSourcePropType;
  headerImageStyle?: StyleProp<ImageStyle>;
  style?: StyleProp<ImageStyle>;
};

export function ThemedScrollView({
  children,
  headerBackgroundColor = { light: '#BFEEBF', dark: '#1D3D47' },
  headerGradient = {
    light: { start: '#4468DA', end: '#BBFFD0' },
    dark: { start: '#1D3D47', end: '#0A1A1F' },
  },
  headerImage,
  headerImageSource = DEFAULT_HEADER_IMAGE,
  headerImageStyle,
  style,
}: ThemedScrollViewProps) {

  const [tapCount, setTapCount] = useState(0);
  const lastTapTimeRef = useRef(0);

  const hiddenSettings = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapTimeRef.current;

    // Reset counter if more than 1/4 second passed since last tap
    if (timeSinceLastTap > 250) {
      setTapCount(1);
    } else {
      setTapCount(prevCount => prevCount + 1);
    }

    // Update last tap time
    lastTapTimeRef.current = now;

    // Navigate to settings after 6 taps
    if (tapCount === 6) {
      router.push('/settings');
    }
  };

  const handleTap = hiddenSettings;

  // Create a non-animated image element with a fallback empty view to ensure it's always a ReactElement
  const renderedHeaderImage = headerImage ||
    (headerImageSource ? (
      <View style={styles.imageWrapper}>
        <Image
          source={headerImageSource}
          style={[styles.defaultHeaderImage, headerImageStyle]}
          // Add key to force re-renders
          key="header-image"
        />
      </View>
    ) : (
      // Fallback empty view to ensure we always have a ReactElement
      <View style={styles.imageWrapper} />
    ));

  return (
    <TouchableWithoutFeedback onPress={handleTap}>
      <View style={{ flex: 1 }}>
        <ParallaxScrollView
          headerBackgroundColor={headerBackgroundColor}
          headerGradient={headerGradient}
          headerImage={renderedHeaderImage}>
          {children}
        </ParallaxScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  imageWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  defaultHeaderImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
});