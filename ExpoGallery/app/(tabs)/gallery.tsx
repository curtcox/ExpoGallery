import { Image, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Link } from 'expo-router';

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }>
      {exampleRow('chat',           'Chat',           'chatbubble-outline',     'chat-example')}
      {exampleRow('icons',          'Icons',          'images-sharp',           'guides/icons/')}
      {exampleRow('map',            'Map',            'map-outline',            'versions/latest/sdk/map-view/')}
      {exampleRow('map-pins',       'Map Pins',       'pin-outline',            'map-pins-example')}
      {exampleRow('fetch',          'Fetch',          'cloud-download-outline', 'versions/latest/sdk/expo/#api')}
      {exampleRow('local-storage',  'Local Storage',  'folder-outline',         'versions/latest/sdk/filesystem/')}
      {exampleRow('json',           'JSON',           'code-outline',           'json-example')}
      {exampleRow('external-app',   'External App',   'open-outline',           'linking/into-other-apps/')}
      {exampleRow('text-to-speech', 'Text to Speech', 'volume-high-outline',    'versions/latest/sdk/speech/')}
      {exampleRow('speech-to-text', 'Speech to Text', 'mic-outline',            'https://github.com/trestrantham/react-native-speech-recognition')}
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
