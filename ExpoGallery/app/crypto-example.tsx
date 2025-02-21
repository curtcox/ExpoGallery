import { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import * as Crypto from 'expo-crypto';

export default function HomeScreen() {
  const [digest, setDigest] = useState<string>('');
  const [uuid, setUuid] = useState<string>('');

  useEffect(() => {
    (async () => {
      const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        'GitHub stars are neat 🌟'
      );
      setDigest(digest);

      const newUuid = Crypto.randomUUID();
      setUuid(newUuid);
    })();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Crypto SHA256 Example</Text>
      <Text style={styles.digestText}>{digest}</Text>
      <Text style={styles.titleText}>Random UUID Example</Text>
      <Text style={styles.digestText}>{uuid}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  digestText: {
    marginTop: 10,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  titleText: {
    marginTop: 20,
  },
});
