import { Text, View } from 'react-native';
import * as Device from 'expo-device';

export default function Example() {
  return (
    <View>
      <Text> {Device.manufacturer}: {Device.modelName} </Text>
      <Text> Name: {Device.deviceName} </Text>
      <Text> Type: {Device.deviceType} </Text>
      <Text> Year Class: {Device.deviceYearClass} </Text>
      <Text> Model ID: {Device.modelId} </Text>
      <Text> Build ID: {Device.osBuildId} </Text>
      <Text> Internal Build ID: {Device.osInternalBuildId} </Text>
      <Text> Build Fingerprint: {Device.osBuildFingerprint} </Text>
      <Text> OS Name: {Device.osName} </Text>
      <Text> OS Version: {Device.osVersion} </Text>
      <Text> Platform API Level: {Device.platformApiLevel} </Text>
      <Text> Product Name: {Device.productName} </Text>
      <Text> Supported CPU Architectures: {Device.supportedCpuArchitectures} </Text>
      <Text> Total Memory: {Device.totalMemory} </Text>
    </View>
  );
}