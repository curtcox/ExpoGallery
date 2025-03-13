import { useState, useEffect } from 'react';
import { Platform, Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import * as Device from 'expo-device';
import { info } from '@/utils/logger';
import { getNetworkStatus, isOnline, useNetworkStatus, useIsWeb } from '@/utils/network';

export default function Example() {
  // State variables
  const [onlineStatus, setOnlineStatus] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<string>('');

  // Get network status using the hook
  const isConnected = useNetworkStatus();
  const isWeb = useIsWeb();

  // Get device information on component mount
  useEffect(() => {
    async function getDeviceInfo() {
      if (!isWeb) {
        const brand = Device.brand || 'unknown';
        const model = Device.modelName || 'unknown';
        const osName = Device.osName || 'unknown';
        const osVersion = Device.osVersion || 'unknown';
        setDeviceInfo(`${brand} ${model}, ${osName} ${osVersion}`);
      } else {
        setDeviceInfo('Web Browser');
      }
    }

    getDeviceInfo();
  }, [isWeb]);

  // Function to check if device is actually online
  const checkOnlineStatus = async () => {
    setIsChecking(true);
    try {
      const online = await isOnline();
      setOnlineStatus(online);
      info(`Online status check: ${online ? 'Online' : 'Offline'}`);
    } catch (error) {
      info(`Error checking online status: ${error}`);
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Network Status</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Device Information</Text>
        <Text style={styles.detail}>Platform: {Platform.OS}</Text>
        <Text style={styles.detail}>Device: {deviceInfo}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Connection Status</Text>
        <Text style={styles.detail}>
          Connected (getNetworkStatus): <Text style={getNetworkStatus() ? styles.online : styles.offline}>
            {getNetworkStatus() ? 'Yes' : 'No'}
          </Text>
        </Text>

        <Text style={styles.detail}>
          Connected (hook): <Text style={isConnected ? styles.online : styles.offline}>
            {isConnected ? 'Yes' : 'No'}
          </Text>
        </Text>

        <View style={styles.checkContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={checkOnlineStatus}
            disabled={isChecking}
          >
            <Text style={styles.buttonText}>{isChecking ? 'Checking...' : 'Check Online Status'}</Text>
          </TouchableOpacity>

          {onlineStatus !== null && (
            <Text style={styles.detail}>
              Online Status: <Text style={onlineStatus ? styles.online : styles.offline}>
                {onlineStatus ? 'Online' : 'Offline'}
              </Text>
            </Text>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>About Network Detection</Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>getNetworkStatus()</Text>: Returns cached network connection state
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>useNetworkStatus()</Text>: Hook that subscribes to network changes
        </Text>
        <Text style={styles.paragraph}>
          • <Text style={styles.bold}>isOnline()</Text>: Checks actual connectivity by making a network request
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  detail: {
    fontSize: 16,
    marginBottom: 4,
  },
  paragraph: {
    fontSize: 15,
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  online: {
    color: 'green',
    fontWeight: 'bold',
  },
  offline: {
    color: 'red',
    fontWeight: 'bold',
  },
  checkContainer: {
    marginTop: 12,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
