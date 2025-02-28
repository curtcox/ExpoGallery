import React from 'react';
import {StyleSheet, Button, Alert, Platform} from 'react-native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import { info } from './log-example';
import { useEffect } from 'react';

const handlePress = (buttonType: string) => {
  const message = `${buttonType} Pressed`;
  info(message);
  console.log(message);
};

export const oneButtonAlert = (message: string) => {
  if (Platform.OS === 'web') {
    window.alert(message);
    handlePress('OK');
  } else {
    Alert.alert('Alert Title', message, [
      {text: 'OK', onPress: () => handlePress('OK')},
    ]);
  }
};

export default function Example() {

  useEffect(() => {
    info('Viewing Alert Example');
  }, []);

  const createTwoButtonAlert = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('My Alert Msg')) {
        handlePress('OK');
      } else {
        handlePress('Cancel');
      }
    } else {
      Alert.alert('Alert Title', 'My Alert Msg', [
        {
          text: 'Cancel',
          onPress: () => handlePress('Cancel'),
          style: 'cancel',
        },
        {text: 'OK', onPress: () => handlePress('OK')},
      ]);
    }
  };

  const createThreeButtonAlert = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('My Alert Msg\n\nPress OK to proceed, or Cancel to "Ask me later"')) {
        if (window.confirm('Press OK to confirm, or Cancel to cancel')) {
          handlePress('OK');
        } else {
          handlePress('Cancel');
        }
      } else {
        handlePress('Ask me later');
      }
    } else {
      Alert.alert('Alert Title', 'My Alert Msg', [
        {
          text: 'Ask me later',
          onPress: () => handlePress('Ask me later'),
        },
        {
          text: 'Cancel',
          onPress: () => handlePress('Cancel'),
          style: 'cancel',
        },
        {text: 'OK', onPress: () => handlePress('OK')},
      ]);
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Button title={'1-Button Alert'} onPress={() => oneButtonAlert('My Alert Msg')} />
        <Button title={'2-Button Alert'} onPress={createTwoButtonAlert} />
        <Button title={'3-Button Alert'} onPress={createThreeButtonAlert} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
});

