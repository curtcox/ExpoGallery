import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';


export default function HomeScreen() {
  return (
      <View>
        <ThemedText type="title">Icons Example</ThemedText>
        {icon('images-sharp')}
        {icon('map-outline')}
        {icon('pin-outline')}
        {icon('cloud-download-outline')}
        {icon('folder-outline')}
        {icon('code-outline')}
        {icon('open-outline')}
        {icon('volume-high-outline')}
        {icon('mic-outline')}
      </View>
  );
}

function icon(name: string) {
  return (
    <View style={styles.iconRow}>
      <Ionicons name={name} size={24} color="black" />
      <ThemedText> {name}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
});
