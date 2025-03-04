import React, { ReactElement, ReactNode } from 'react';
import { Image, ImageSourcePropType, StyleProp, StyleSheet, ImageStyle } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';

const DEFAULT_HEADER_IMAGE = require('@/assets/images/logo.png');

type ThemedScrollViewProps = {
  children: ReactNode;
  headerBackgroundColor?: { light: string; dark: string };
  headerImage?: ReactElement;
  headerImageSource?: ImageSourcePropType;
  headerImageStyle?: StyleProp<ImageStyle>;
  style?: StyleProp<ImageStyle>;
};

export function ThemedScrollView({
  children,
  headerBackgroundColor = { light: '#BFEEBF', dark: '#1D3D47' },
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
        style={[styles.defaultHeaderImage, headerImageStyle]}
      />
    ) : <></>); // Empty fragment as fallback to avoid null

  return (
    <ParallaxScrollView
      headerBackgroundColor={headerBackgroundColor}
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
  }
});