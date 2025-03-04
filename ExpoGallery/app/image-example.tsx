import { Image, ScrollView, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
export default function Example() {

  return (
    <ScrollView>
        <ThemedText>React Logos</ThemedText>
        <Image
          source={require('../assets/images/react-logo.png')}
          style={{ width: 30, height: 30 }}
        />
        <Image
          source={require('../assets/images/partial-react-logo.png')}
          style={{ width: 30, height: 30 }}
        />

        <ThemedText>Logos</ThemedText>
        <Image source={require('@/assets/images/logo.png')} />

        <ThemedText>Icons</ThemedText>
        <Image source={require('../assets/images/icon.png')} />
        <Image source={require('../assets/images/splash-icon.png')} />
    </ScrollView>
  );
}