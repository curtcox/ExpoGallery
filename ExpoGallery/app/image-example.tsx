import { Image } from 'react-native';

export default function HomeScreen() {
  return (
        <Image
          source={require('../assets/images/react-logo.png')}
          style={{ width: 30, height: 30 }}
        />
  );
}