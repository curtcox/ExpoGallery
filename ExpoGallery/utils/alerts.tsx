import { Alert, Platform} from 'react-native';
import { info } from '../utils/logger';

export const handlePress = (buttonType: string) => {
    const message = `${buttonType} Pressed`;
    info(message);
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
