import React, { ReactElement, ReactNode } from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, ImageStyle, Dimensions } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';

const DEFAULT_HEADER_IMAGE = require('@/assets/images/logo.png');
const { width } = Dimensions.get('window');
const IS_SMALL_SCREEN = width < 390;

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
  // Determine the header image to use
  const renderedHeaderImage = headerImage ||
    (headerImageSource ? (
      <Image
        source={headerImageSource}
        style={[
          styles.defaultHeaderImage,
          IS_SMALL_SCREEN && styles.smallScreenImage,
          headerImageStyle
        ]}
        // Ensure image loads properly with a key to force re-render
        key="header-image"
        // Force layout measurement
        onLayout={() => {}}
        // Ensure image is loaded before displaying
        fadeDuration={0}
        // Prioritize image loading
        progressiveRenderingEnabled={true}
      />
    ) : <></>);

  return (
    <ParallaxScrollView
      headerBackgroundColor={headerBackgroundColor}
      headerGradient={headerGradient}
      headerImage={renderedHeaderImage}>
      {children}
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  defaultHeaderImage: {
    width: IS_SMALL_SCREEN ? '80%' : '100%',
    height: IS_SMALL_SCREEN ? '80%' : '100%',
    resizeMode: 'contain',
    // Use absolute positioning to ensure it stays visible
    position: 'absolute',
    // Center the image
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    // Ensure the image is always visible
    zIndex: 30,
  },
  smallScreenImage: {
    // Additional adjustments for very small screens
    maxWidth: '80%',
    maxHeight: '70%',
  }
});