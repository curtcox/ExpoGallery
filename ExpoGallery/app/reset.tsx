import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Platform } from 'react-native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StorageInfo {
  asyncStorageKeys: Array<{key: string, size: number, value: string}>;
  asyncStorageTotalSize: number;
}

function useAppReset() {
  const getStorageInfo = useCallback(async (): Promise<StorageInfo> => {
    try {
      // Get all keys
      const keys = await AsyncStorage.getAllKeys();

      // Get values for all keys
      const asyncStorageItems = await Promise.all(
        keys.map(async (key) => {
          const value = await AsyncStorage.getItem(key) || '';
          const size = new Blob([value]).size;
          return { key, size, value };
        })
      );

      // Calculate total size
      const asyncStorageTotalSize = asyncStorageItems.reduce((total, item) => total + item.size, 0);

      return {
        asyncStorageKeys: asyncStorageItems,
        asyncStorageTotalSize
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        asyncStorageKeys: [],
        asyncStorageTotalSize: 0
      };
    }
  }, []);

  const clearStorageData = useCallback(async () => {
    try {
      // Get storage info before clearing
      const storageInfo = await getStorageInfo();

      // Clear all keys
      await AsyncStorage.clear();

      return storageInfo;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return {
        asyncStorageKeys: [],
        asyncStorageTotalSize: 0
      };
    }
  }, [getStorageInfo]);

  const reloadPage = useCallback(() => {
    // Reload the page to reset React state
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      // For native platforms, you might want to use React Navigation to reset to initial screen
      // or use a state management solution to reset app-wide state
    }
  }, []);

  const resetAppState = useCallback(async () => {
    const clearedData = await clearStorageData();
    reloadPage();
    return clearedData;
  }, [clearStorageData, reloadPage]);

  // Helper function to format bytes to a human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return { resetAppState, getStorageInfo, formatBytes };
}

export default function ResetScreen() {
  const { resetAppState, getStorageInfo, formatBytes } = useAppReset();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load storage information when the screen mounts
  useEffect(() => {
    refreshStorageInfo();
  }, []);

  const handleReset = async () => {
    setIsLoading(true);
    try {
      const info = await resetAppState();
      setStorageInfo(info);
    } catch (error) {
      console.error('Error resetting app state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStorageInfo = async () => {
    setIsLoading(true);
    try {
      const info = await getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error('Error refreshing storage info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Reset</Text>
      <Text style={styles.text}>View and reset your app's stored data.</Text>

      <View style={styles.buttonContainer}>
        <Button title={isLoading ? "Loading..." : "Refresh Storage Info"} onPress={refreshStorageInfo} disabled={isLoading} />
        <View style={styles.buttonSpacer} />
        <Button title={isLoading ? "Loading..." : "Reset App State"} onPress={handleReset} color="#ff6347" disabled={isLoading} />
      </View>

      {storageInfo && (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Storage Information:</Text>

          <View style={styles.storageSection}>
            <Text style={styles.storageTitle}>
              AsyncStorage ({storageInfo.asyncStorageKeys.length} items, {formatBytes(storageInfo.asyncStorageTotalSize)} total)
            </Text>
            {storageInfo.asyncStorageKeys.length > 0 ? (
              storageInfo.asyncStorageKeys.map((item: {key: string, size: number, value: string}) => (
                <Text key={item.key} style={styles.keyItem}>
                  • {item.key} - {formatBytes(item.size)}
                </Text>
              ))
            ) : (
              <Text style={styles.emptyMessage}>No items found</Text>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  text: {
    fontSize: 16,
    marginBottom: 24,
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  buttonSpacer: {
    width: 12,
  },
  resultsContainer: {
    marginTop: 16,
    maxHeight: '70%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  storageSection: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  keyItem: {
    fontSize: 14,
    marginBottom: 4,
    color: '#555',
  },
  emptyMessage: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#888',
  },
});