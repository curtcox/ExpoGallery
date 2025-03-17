import { View, StyleSheet, Button } from 'react-native';
import * as Speech from 'expo-speech';

const speak = () => {
    const thingToSay = 'Text to speech';
    Speech.speak(thingToSay);
};

export default function Example() {
  return (
    <View style={styles.container}>
      <Button title="Text to speech" onPress={speak} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
});
