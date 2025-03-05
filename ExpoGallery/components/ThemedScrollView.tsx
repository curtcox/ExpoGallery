import React, { ReactElement, ReactNode } from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, ImageStyle, View } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';

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
  // Create a non-animated image element
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
    ) : null);

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