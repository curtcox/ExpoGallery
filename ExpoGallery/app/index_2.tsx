import { Image, StyleSheet, TouchableOpacity } from 'react-native';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';

export default function HomeScreen_2() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.reactLogo}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Connecting people to services</ThemedText>
      </ThemedView>
      <ThemedView style={styles.linksContainer}>
        <Link href="/map" style={styles.link}>
          <ThemedText type="link" style={styles.linkText}>Look at the map</ThemedText>
        </Link>
        <Link href="/resources" style={styles.link}>
          <ThemedText type="link" style={styles.linkText}>Look at the resources</ThemedText>
        </Link>
        <Link href="/chat" style={styles.link}>
          <ThemedText type="link" style={styles.linkText}>Chat with the bot</ThemedText>
        </Link>
        <Link href="/profile" style={styles.link}>
          <ThemedText type="link" style={styles.linkText}>View your profile</ThemedText>
        </Link>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  contentContainer: {
    padding: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featureItem: {
    marginVertical: 5,
  },
  reactLogo: {
    height: 491,
    width: 800,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
  linksContainer: {
    padding: 16,
    gap: 16,
  },
  link: {
    backgroundColor: 'rgba(10, 126, 164, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(10, 126, 164, 0.2)',
  },
  linkText: {
    fontSize: 18,
    fontWeight: '600',
  },
});