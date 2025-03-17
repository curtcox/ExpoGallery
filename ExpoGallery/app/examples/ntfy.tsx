import React, { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { info, error } from '@/utils/logger';
import { useColorScheme, Text, View, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { Link } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

export default function Example() {
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('3');
  const [tags, setTags] = useState('');
  const [clickUrl, setClickUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const sendNotification = async () => {
    if (!topic) {
      Alert.alert('Error', 'Topic is required');
      return;
    }

    if (!message) {
      Alert.alert('Error', 'Message is required');
      return;
    }

    try {
      setIsLoading(true);
      setResult('');

      const headers = new Headers();
      if (title) headers.append('Title', title);
      if (priority) headers.append('Priority', priority);
      if (tags) headers.append('Tags', tags);
      if (clickUrl) headers.append('Click', clickUrl);

      const response = await fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        headers,
        body: message
      });

      if (response.ok) {
        const responseData = await response.text();
        setResult('Message sent successfully!');
        info('Ntfy message sent successfully', {});
      } else {
        const errorData = await response.text();
        setResult(`Error: ${response.status} - ${errorData}`);
        error(`Ntfy API error: ${response.status} - ${errorData}`, {});
      }
    } catch (err: unknown) {
      setResult(`Error: ${err instanceof Error ? err.message : String(err)}`);
      error(`Ntfy error: ${err instanceof Error ? err.message : String(err)}`, {});
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedText style={styles.header}>ntfy Message Sender</ThemedText>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Topic (required)</ThemedText>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="Enter topic name"
          placeholderTextColor={isDark ? '#888' : '#aaa'}
          value={topic}
          onChangeText={setTopic}
        />
        <ThemedText style={styles.helpText}>
          The topic is essentially a password, so pick something that's not easily guessable.
        </ThemedText>
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Message (required)</ThemedText>
        <TextInput
          style={[styles.textarea, isDark && styles.inputDark]}
          placeholder="Enter your message"
          placeholderTextColor={isDark ? '#888' : '#aaa'}
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <ThemedText style={styles.label}>Title</ThemedText>
        <TextInput
          style={[styles.input, isDark && styles.inputDark]}
          placeholder="Optional notification title"
          placeholderTextColor={isDark ? '#888' : '#aaa'}
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.toggleContainer}>
        <ThemedText>Show Advanced Options</ThemedText>
        <Switch
          value={showAdvanced}
          onValueChange={setShowAdvanced}
        />
      </View>

      {showAdvanced && (
        <>
          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Priority</ThemedText>
            <View style={[styles.pickerContainer, isDark && styles.pickerContainerDark]}>
              <Picker
                selectedValue={priority}
                onValueChange={(itemValue) => setPriority(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Min (1)" value="1" />
                <Picker.Item label="Low (2)" value="2" />
                <Picker.Item label="Default (3)" value="3" />
                <Picker.Item label="High (4)" value="4" />
                <Picker.Item label="Urgent (5)" value="5" />
              </Picker>
            </View>
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Tags</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Optional comma-separated tags (e.g. warning,skull)"
              placeholderTextColor={isDark ? '#888' : '#aaa'}
              value={tags}
              onChangeText={setTags}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={styles.label}>Click URL</ThemedText>
            <TextInput
              style={[styles.input, isDark && styles.inputDark]}
              placeholder="Optional URL to open when clicked"
              placeholderTextColor={isDark ? '#888' : '#aaa'}
              value={clickUrl}
              onChangeText={setClickUrl}
            />
          </View>
        </>
      )}

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={sendNotification}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Sending...' : 'Send Notification'}
        </Text>
      </TouchableOpacity>

      {result ? (
        <View style={styles.resultContainer}>
          <ThemedText style={styles.resultText}>{result}</ThemedText>
        </View>
      ) : null}

      <View style={styles.footer}>
        <Link href="https://docs.ntfy.sh/publish/" style={styles.link}>
          <ThemedText>ntfy Documentation</ThemedText>
        </Link>
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
    fontWeight: 'bold',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputDark: {
    backgroundColor: '#333',
    borderColor: '#555',
    color: '#fff',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  pickerContainerDark: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultText: {
    fontSize: 16,
  },
  footer: {
    marginTop: 30,
    marginBottom: 20,
    alignItems: 'center',
  },
  link: {
    marginVertical: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  helpText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});