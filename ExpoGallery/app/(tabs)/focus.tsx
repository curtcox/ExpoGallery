import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Link } from 'expo-router';
import { info } from '../log-example';

export default function HomeScreen() {
  useEffect(() => {
    info('Viewing Gallery');
  }, []);
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      {exampleRow('log',         'Log',         'warning-outline',        'versions/latest/sdk/flash-list/')}
      {exampleRow('map-pins',    'Map Pins',    'pin-outline',            'map-pins-example')}
      {exampleRow('gifted-chat', 'Gifted Chat', 'chatbubble-outline',     'https://github.com/FaridSafi/react-native-gifted-chat')}
    </ParallaxScrollView>
  );
}

function exampleRow(name: string, text: string, icon: string, url: string) {
  const examplePage = `/${name}-example`;
  const docUrl = url.startsWith('https') ? url : `https://docs.expo.dev/${url}`;
  return (
    <View style={styles.linkRow}>
      <Ionicons name={icon} size={24} color="black" />
      <View style={styles.docsLinkContainer}>
        <Link href={docUrl}>Docs</Link>
      </View>
      <View style={styles.spacer} />
      <View style={styles.primaryLinkContainer}>
        <Link href={examplePage}>{text} Example</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  primaryLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docsLinkContainer: {
    marginLeft: 50, // adjust this value to ensure the docs links are aligned
  },
  spacer: {
    flex: 1,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
