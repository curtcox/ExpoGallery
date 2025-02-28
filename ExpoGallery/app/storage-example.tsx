import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, TextInput, Button, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { info, error } from './log-example';

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

const getAllKeys = async (setStorageKeys: Function) => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    setStorageKeys(keys);
    info('Retrieved all storage keys');
  } catch (e) {
    error('Error getting all keys', e);
  }
};

interface SaveFormProps {
  keyName: string;
  onChangeKey: (text: string) => void;
  value: string;
  onChangeValue: (text: string) => void;
  handleSave: () => void;
}

interface LoadFormProps {
  loadKey: string;
  setLoadKey: (text: string) => void;
  handleLoad: () => void;
}

interface LastOperationDisplayProps {
  lastOperation: {
    key: string;
    value: string;
    type: string;
  };
}

interface KeysDisplayProps {
  storageKeys: string[];
  refreshKeys: () => void;
  handleKeyPress: (key: string) => void;
}

const SaveForm = ({ keyName, onChangeKey, value, onChangeValue, handleSave }: SaveFormProps) => (
  <>
    <Text style={styles.paragraph}>Save an item, and grab it later!</Text>
    <TextInput
      style={styles.textInput}
      clearTextOnFocus
      onChangeText={text => onChangeKey(text)}
      value={keyName}
    />
    <TextInput
      style={styles.textInput}
      clearTextOnFocus
      onChangeText={text => onChangeValue(text)}
      value={value}
    />
    <Button
      title="Save this key/value pair"
      onPress={handleSave}
    />
  </>
);

const LoadForm = ({ loadKey, setLoadKey, handleLoad }: LoadFormProps) => (
  <>
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
        onPress={handleLoad}
      />
    </View>
  </>
);

const LastOperationDisplay = ({ lastOperation }: LastOperationDisplayProps) => {
  if (!lastOperation.key) return null;

  return (
    <View style={styles.lastOperation}>
      <Text style={styles.lastOperationTitle}>
        Last {lastOperation.type} operation:
      </Text>
      <Text>Key: {lastOperation.key}</Text>
      <Text>Value: {JSON.stringify(lastOperation.value)}</Text>
    </View>
  );
};

const KeysDisplay = ({ storageKeys, refreshKeys, handleKeyPress }: KeysDisplayProps) => (
  <View style={styles.keysContainer}>
    <View style={styles.keysHeader}>
      <Text style={styles.keysTitle}>All Storage Keys:</Text>
      <Button
        title="Refresh"
        onPress={refreshKeys}
      />
    </View>

    {storageKeys.length > 0 ? (
      <FlatList
        data={storageKeys}
        renderItem={({ item }) => (
          <Text
            style={styles.keyItem}
            onPress={() => handleKeyPress(item)}
          >
            {item}
          </Text>
        )}
        keyExtractor={(item) => item}
        style={styles.keysList}
      />
    ) : (
      <Text style={styles.noKeys}>No keys in storage</Text>
    )}
  </View>
);

export default function Example() {
  const [key, onChangeKey] = useState('Your key here');
  const [value, onChangeValue] = useState('Your value here');
  const [loadKey, setLoadKey] = useState('');
  const [lastOperation, setLastOperation] = useState({ key: '', value: '', type: '' });
  const [storageKeys, setStorageKeys] = useState<string[]>([]);

  useEffect(() => {
    info('Viewing Storage Example');
    getAllKeys(setStorageKeys);
  }, []);

  useEffect(() => {
    if (lastOperation.type) {
      getAllKeys(setStorageKeys);
    }
  }, [lastOperation]);

  const handleSave = () => {
    save(key, value, setLastOperation);
    onChangeKey('Your key here');
    onChangeValue('Your value here');
  };

  const handleLoad = () => {
    getValueFor(loadKey, setLastOperation, onChangeKey, onChangeValue);
    setLoadKey('');
  };

  const handleKeyPress = (selectedKey: string) => {
    setLoadKey(selectedKey);
    getValueFor(selectedKey, setLastOperation, onChangeKey, onChangeValue);
  };

  return (
    <View style={styles.container}>
      <SaveForm
        keyName={key}
        onChangeKey={onChangeKey}
        value={value}
        onChangeValue={onChangeValue}
        handleSave={handleSave}
      />

      <LoadForm
        loadKey={loadKey}
        setLoadKey={setLoadKey}
        handleLoad={handleLoad}
      />

      <LastOperationDisplay lastOperation={lastOperation} />

      <KeysDisplay
        storageKeys={storageKeys}
        refreshKeys={() => getAllKeys(setStorageKeys)}
        handleKeyPress={handleKeyPress}
      />
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
  // New styles for the keys display
  keysContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    maxHeight: 200,
  },
  keysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  keysTitle: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  keysList: {
    maxHeight: 150,
  },
  keyItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    color: '#0066cc',
  },
  noKeys: {
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10,
  },
});