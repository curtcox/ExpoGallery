import { KeyboardAvoidingView, Platform, TextInput } from 'react-native';

export default function Example() {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <TextInput placeholder="Type here..." />
    </KeyboardAvoidingView>
  );
}
