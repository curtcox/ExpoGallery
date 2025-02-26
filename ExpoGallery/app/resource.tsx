import { Text, Image, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import resourcesData from '../assets/json/resources.json';
import ParallaxScrollView from '@/components/ParallaxScrollView';

export default function Route() {
      const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const resource = resourcesData.resources.find(r => r.id === id);
  return (
    <ParallaxScrollView
    headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    headerImage={
      <Image
        source={require('@/assets/images/partial-react-logo.png')}
        style={styles.reactLogo}
      />
    }>
    <Text>Resource: {resource?.name}</Text>
    <Text>Category: {resource?.category}</Text>
    <Text>Location: {resource?.location.address}</Text>
    <Text>Details: {resource?.details}</Text>
    <Text>Contact: {resource?.contact.phone}</Text>
    <Text>Hours: {resource?.hours}</Text>
    <Text>Languages Supported: {resource?.languagesSupported.join(', ')}</Text>
    <Text>Average Rating: {resource?.averageRating}</Text>
  </ParallaxScrollView>)
  ;
}

const styles = StyleSheet.create({
    reactLogo: {
      height: 178,
      width: 290,
      bottom: 0,
      left: 0,
      position: 'absolute',
    },
  });