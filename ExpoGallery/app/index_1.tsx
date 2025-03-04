import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedScrollView } from '@/components/ThemedScrollView';
import { Link } from 'expo-router';

export default function HomeScreen_1() {
  return (
    <ThemedScrollView>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Connecting people to services</ThemedText>
      </ThemedView>
      <ThemedView style={styles.linksContainer}>
        <Link href="/map" style={styles.link}>
          <ThemedText type="link" style={styles.linkText}>Find Support Near Me</ThemedText>
        </Link>
        <Link href="/resources" style={styles.link}>
          <ThemedText type="link" style={styles.linkText}>Find A Place to Stay</ThemedText>
        </Link>
        <Link href="/chat" style={styles.link}>
          <ThemedText type="link" style={styles.linkText}>Chat with the bot</ThemedText>
        </Link>
        <Link href="/profile" style={styles.link}>
          <ThemedText type="link" style={styles.linkText}>View your profile</ThemedText>
        </Link>
      </ThemedView>
    </ThemedScrollView>
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