import { useState } from 'react';
import { Text, View, StyleSheet, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { info, error } from './log-example';
import { useEffect } from 'react';

const save = async (key: string, value: string, setLastOperation: Function) => {
  try {
    await AsyncStorage.setItem(key, value);
    setLastOperation({ key, value, type: 'saved' });
    info(`Saved ${value} for ${key}`);
  } catch (e) {
    error('Error saving value for key: ' + key, e);
  }
};

const getValueFor = async (key: string, setLastOperation: Function, onChangeKey: Function, onChangeValue: Function) => {
    try {
    const value = await AsyncStorage.getItem(key);
    info(`${value} retrieved for ${key}`);
    setLastOperation({ key, value, type: 'loaded' });
    onChangeKey(key);
    onChangeValue(value);
    return value;
  } catch (e) {
    error('Error getting value for key: ' + key, e);
  }
};

export default function HomeScreen() {
  const [key, onChangeKey] = useState('Your key here');
  const [value, onChangeValue] = useState('Your value here');
  const [loadKey, setLoadKey] = useState(''); // New state for the load key input
  const [lastOperation, setLastOperation] = useState({ key: '', value: '', type: '' });

  useEffect(() => {
    info('Viewing Storage Example');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.paragraph}>Save an item, and grab it later!</Text>

      <TextInput
        style={styles.textInput}
        clearTextOnFocus
        onChangeText={text => onChangeKey(text)}
        value={key}
      />
      <TextInput
        style={styles.textInput}
        clearTextOnFocus
        onChangeText={text => onChangeValue(text)}
        value={value}
      />

      <Button
        title="Save this key/value pair"
        onPress={() => {
          save(key, value, setLastOperation);
          onChangeKey('Your key here');
          onChangeValue('Your value here');
        }}
      />

      <Text style={styles.paragraph}>Enter your key</Text>
      <View style={styles.loadContainer}>
        <TextInput
          style={[styles.textInput, styles.loadInput]}
          onChangeText={setLoadKey}
          value={loadKey}
          placeholder="Enter the key for the value you want to get"
        />
        <Button
          title="Load"
          onPress={() => {
            getValueFor(loadKey, setLastOperation, onChangeKey, onChangeValue);
            setLoadKey('');
          }}
        />
      </View>

      {lastOperation.key && (
        <View style={styles.lastOperation}>
          <Text style={styles.lastOperationTitle}>
            Last {lastOperation.type} operation:
          </Text>
          <Text>Key: {lastOperation.key}</Text>
          <Text>Value: {JSON.stringify(lastOperation.value)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: 10,
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    marginTop: 34,
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textInput: {
    height: 35,
    borderColor: 'gray',
    borderWidth: 0.5,
    padding: 4,
  },
  loadContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  loadInput: {
    flex: 1,
  },
  lastOperation: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  lastOperationTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});