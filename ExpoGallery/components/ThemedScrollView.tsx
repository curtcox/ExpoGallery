import React, { ReactElement, ReactNode } from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, ImageStyle, Dimensions, Platform } from 'react-native';
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
          // Apply different styles based on screen size
          IS_SMALL_SCREEN && styles.smallScreenImage,
          headerImageStyle
        ]}
      />
    ) : <></>); // Empty fragment as fallback to avoid null

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
    flex: 1,
    width: '100%',
    resizeMode: 'contain',
    alignSelf: 'center',
    position: 'relative',
  },
  smallScreenImage: {
    // Adjust image for smaller screens
    width: '80%',
    maxHeight: '80%',
    // Ensure the image stays visible even with parallax effect
    marginTop: 20,
  }
});