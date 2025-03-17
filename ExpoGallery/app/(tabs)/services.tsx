import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { settings, updateChatSettings, subscribeToSettingsChanges } from '@/storage/settings';
import { Ionicons } from '@expo/vector-icons';

export default function ServicesScreen() {
  const [chatExternal, setChatExternal] = useState(settings.services?.chat?.external ?? true);
  const [chatTimeout, setChatTimeout] = useState(
    (settings.services?.chat?.timeout ?? 30000).toString()
  );

  // Load settings when component mounts
  useEffect(() => {
    const unsubscribe = subscribeToSettingsChanges((newSettings) => {
      setChatExternal(newSettings.services?.chat?.external ?? true);
      setChatTimeout((newSettings.services?.chat?.timeout ?? 30000).toString());
    });

    return unsubscribe;
  }, []);

  const handleChatExternalToggle = () => {
    const newValue = !chatExternal;
    setChatExternal(newValue);
    updateChatSettings(newValue, undefined);
  };

  const handleChatTimeoutChange = (timeout: string) => {
    setChatTimeout(timeout);
  };

  const saveTimeout = () => {
    const timeoutValue = parseInt(chatTimeout, 10);
    if (!isNaN(timeoutValue) && timeoutValue > 0) {
      updateChatSettings(undefined, timeoutValue);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Services Settings</ThemedText>

      <View style={styles.section}>
        <ThemedText type="subtitle">Chat Service</ThemedText>

        <View style={styles.option}>
          <View style={styles.optionLabel}>
            <ThemedText type="default">Use External Chat Service</ThemedText>
            <ThemedText type="default" style={styles.description}>
              When enabled, chat requests are sent to external service
            </ThemedText>
          </View>
          <Switch value={chatExternal} onValueChange={handleChatExternalToggle} />
        </View>

        <View style={styles.option}>
          <View style={styles.optionLabel}>
            <ThemedText type="default">Chat Timeout (ms)</ThemedText>
            <ThemedText type="default" style={styles.description}>
              Maximum time to wait for chat responses
            </ThemedText>
          </View>
          <View style={styles.timeoutContainer}>
            <TextInput
              style={styles.timeoutInput}
              value={chatTimeout}
              onChangeText={handleChatTimeoutChange}
              keyboardType="numeric"
              onBlur={saveTimeout}
              onSubmitEditing={saveTimeout}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveTimeout}>
              <Ionicons name="save-outline" size={20} color="#2196F3" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
    borderRadius: 8,
    padding: 16,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  optionLabel: {
    flex: 1,
  },
  description: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  timeoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeoutInput: {
    borderWidth: 1,
    borderColor: 'rgba(150, 150, 150, 0.3)',
    borderRadius: 4,
    padding: 8,
    width: 100,
    textAlign: 'right',
  },
  saveButton: {
    marginLeft: 8,
    padding: 8,
  },
});
