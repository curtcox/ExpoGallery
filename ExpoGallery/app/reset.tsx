import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Platform } from 'react-native';
import { useCallback } from 'react';

interface StorageInfo {
  localStorageKeys: string[];
  sessionStorageKeys: string[];
}

function useAppReset() {
  const getStorageInfo = useCallback((): StorageInfo => {
    const localStorageKeys = Object.keys(localStorage);
    const sessionStorageKeys = Object.keys(sessionStorage);

    return {
      localStorageKeys,
      sessionStorageKeys
    };
  }, []);

  const clearStorageData = useCallback(() => {
    const localStorageKeys = Object.keys(localStorage);
    const sessionStorageKeys = Object.keys(sessionStorage);

    localStorageKeys.forEach(key => localStorage.removeItem(key));
    sessionStorageKeys.forEach(key => sessionStorage.removeItem(key));

    return {
      localStorageKeys,
      sessionStorageKeys
    };
  }, []);

  const reloadPage = useCallback(() => {
    // Reload the page to reset React state
    if (Platform.OS === 'web') {
      window.location.reload();
    } else {
      // For native platforms, you might want to use React Navigation to reset to initial screen
      // or use a state management solution to reset app-wide state
    }
  }, []);

  const resetAppState = useCallback(() => {
    const clearedData = clearStorageData();
    reloadPage();
    return clearedData;
  }, [clearStorageData, reloadPage]);

  return { resetAppState, getStorageInfo };
}

export default function ResetScreen() {
  const { resetAppState, getStorageInfo } = useAppReset();
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  // Load storage information when the screen mounts
  useEffect(() => { setStorageInfo(getStorageInfo());}, [getStorageInfo]);

  const handleReset = () => {
    const info = resetAppState();
    setStorageInfo(info);
  };

  const refreshStorageInfo = () => { setStorageInfo(getStorageInfo());};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Reset</Text>
      <Text style={styles.text}>View and reset your app's stored data.</Text>

      <View style={styles.buttonContainer}>
        <Button title="Refresh Storage Info" onPress={refreshStorageInfo} />
        <View style={styles.buttonSpacer} />
        <Button title="Reset App State" onPress={handleReset} color="#ff6347" />
      </View>

      {storageInfo && (
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.sectionTitle}>Storage Information:</Text>

          <View style={styles.storageSection}>
            <Text style={styles.storageTitle}>LocalStorage ({storageInfo.localStorageKeys.length} items)</Text>
            {storageInfo.localStorageKeys.length > 0 ? (
              storageInfo.localStorageKeys.map((key: string) => (
                <Text key={key} style={styles.keyItem}>• {key}</Text>
              ))
            ) : (
              <Text style={styles.emptyMessage}>No items found</Text>
            )}
          </View>

          <View style={styles.storageSection}>
            <Text style={styles.storageTitle}>SessionStorage ({storageInfo.sessionStorageKeys.length} items)</Text>
            {storageInfo.sessionStorageKeys.length > 0 ? (
              storageInfo.sessionStorageKeys.map((key: string) => (
                <Text key={key} style={styles.keyItem}>• {key}</Text>
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