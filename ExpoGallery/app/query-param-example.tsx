import { useLocalSearchParams, router } from 'expo-router';
import { useState } from 'react';
import { TextInput, View } from 'react-native';

export default function Page() {
  const params = useLocalSearchParams<{ query?: string }>();
  const [search, setSearch] = useState(params.query);

  return (
    <TextInput
      value={search}
      onChangeText={search => {
        setSearch(search);
        router.setParams({ query: search });
      }}
      placeholderTextColor="#A0A0A0"
      placeholder="Search"
      style={{
        borderRadius: 12,
        backgroundColor: '#fff',
        fontSize: 24,
        color: '#000',
        margin: 12,
        padding: 16,
      }}
    />
  );
}
