import { Image, View } from 'react-native';

export default function HomeScreen() {

  return (
    <View>
        <Image
          source={require('../assets/images/react-logo.png')}
          style={{ width: 30, height: 30 }}
        />
        <Image
          source={require('../assets/images/icon.png')}
          style={{ width: 30, height: 30 }}
        />
        <Image
          source={require('../assets/images/partial-react-logo.png')}
          style={{ width: 30, height: 30 }}
        />
        <Image
          source={require('../assets/images/splash-icon.png')}
          style={{ width: 30, height: 30 }}
        />
    </View>
  );
}