import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { settings, updateSettings, subscribeToSettingsChanges } from '@/storage/settings';
import { Ionicons } from '@expo/vector-icons';

export default function OverridesScreen() {
  const [overrides, setOverrides] = useState(settings.overrides || '');
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Subscribe to settings changes
    const unsubscribe = subscribeToSettingsChanges((newSettings) => {
      setOverrides(newSettings.overrides || '');
    });

    return unsubscribe;
  }, []);

  const validateJSON = (jsonString: string): boolean => {
    if (!jsonString.trim()) {
      setIsValid(true);
      setErrorMessage('');
      return true;
    }

    try {
      JSON.parse(jsonString);
      setIsValid(true);
      setErrorMessage('');
      return true;
    } catch (e) {
      if (e instanceof Error) {
        setIsValid(false);
        setErrorMessage(e.message);
      } else {
        setIsValid(false);
        setErrorMessage('Invalid JSON format');
      }
      return false;
    }
  };

  const handleSave = () => {
    if (validateJSON(overrides)) {
      updateSettings({ overrides });
      Alert.alert('Success', 'Overrides saved successfully');
    } else {
      Alert.alert('Error', `Could not save overrides: ${errorMessage}`);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Confirm Reset',
      'Are you sure you want to clear all overrides?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          onPress: () => {
            setOverrides('');
            updateSettings({ overrides: '' });
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText type="title" style={styles.header}>Overrides</ThemedText>

        <View style={styles.infoBox}>
          <ThemedText type="default">
            Enter JSON overrides for advanced app customization.
            Only edit if you know what you're doing.
          </ThemedText>
        </View>

        <TextInput
          style={[
            styles.editor,
            !isValid && styles.invalidEditor
          ]}
          multiline
          numberOfLines={20}
          value={overrides}
          onChangeText={(text) => {
            setOverrides(text);
            validateJSON(text);
          }}
          placeholder="{ /* Enter your JSON overrides here */ }"
          placeholderTextColor="gray"
        />

        {!isValid && (
          <View style={styles.errorContainer}>
            <ThemedText type="default" style={styles.errorText}>
              {errorMessage}
            </ThemedText>
          </View>
        )}

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.saveButton, !isValid && styles.disabledButton]}
            onPress={handleSave}
            disabled={!isValid}
          >
            <Ionicons name="save-outline" size={20} color="white" />
            <ThemedText type="default" style={styles.buttonText}>Save</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={handleReset}
          >
            <Ionicons name="refresh-outline" size={20} color="white" />
            <ThemedText type="default" style={styles.buttonText}>Reset</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  infoBox: {
    backgroundColor: 'rgba(100, 100, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(100, 100, 255, 0.5)',
  },
  editor: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontFamily: 'monospace',
    minHeight: 300,
    textAlignVertical: 'top',
  },
  invalidEditor: {
    borderColor: 'red',
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  errorText: {
    color: 'red',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  resetButton: {
    backgroundColor: '#F44336',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
  },
});
