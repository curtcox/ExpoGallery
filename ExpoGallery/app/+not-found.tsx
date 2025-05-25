import '@/utils/reactGlobal';
import { Link, Stack, usePathname, useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { getResourceById } from '@/services/data';
import { info } from '@/utils/logger';

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
    info(`NotFoundScreen being called for path: ${path}`);

    if (isValidGeohash(path)) {
      info(`Path is a valid geohash: ${path}`);
      if (getResourceById(path)) {
        info(`Redirecting to resource page for ${path}`);
        router.replace(`/resource?id=${path}`);
      } else {
        info(`Redirecting to map page for ${path}`);
        router.replace(`/map?resourceId=${path}`);
      }
    } else {
      info(`Not a valid geohash: ${path}`);
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
