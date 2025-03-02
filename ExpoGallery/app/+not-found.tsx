import { Link, Stack, usePathname, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getResourceById } from '@/services/data';

function isValidGeohash(str: string): boolean {
  if (str.length !== 10) return false;

  for (let i = 0; i < str.length; i++) {
    const validChars = '0123456789bcdefghjkmnpqrstuvwxyz';
    if (!validChars.includes(str[i].toLowerCase())) {
      return false;
    }
  }

  return true;
}

export default function NotFoundScreen() {
  const pathname = usePathname();
  const router = useRouter();
  const path = pathname.startsWith('/') ? pathname.substring(1) : pathname;

  useEffect(() => {
    if (isValidGeohash(path)) {
      if (getResourceById(path)) {
        router.replace(`/resource?id=${path}`);
      } else {
        router.replace(`/map?resourceId=${path}`);
      }
    }
    // If not a valid geohash, continue showing the not found screen
  }, [path, router]);

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">The screen {pathname} doesn't exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
