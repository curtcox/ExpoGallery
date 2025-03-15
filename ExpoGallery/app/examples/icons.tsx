import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { StyleSheet, ScrollView, View } from 'react-native';
import { Link } from 'expo-router';

export default function Example() {
  return (
      <ScrollView style={styles.container}>
        <ThemedText type="title">Icons Example</ThemedText>
        <Link href='https://ionic.io/ionicons'>Iconicons</Link>
        {ionIcon('images-sharp')}
        {ionIcon('map-outline')}
        {ionIcon('pin-outline')}
        {ionIcon('cloud-download-outline')}
        {ionIcon('folder-outline')}
        {ionIcon('code-outline')}
        {ionIcon('open-outline')}
        {ionIcon('volume-high-outline')}
        {ionIcon('mic-outline')}

        <ThemedText type="title" style={styles.sectionTitle}>Material Icons</ThemedText>
        <Link href='https://fonts.google.com/icons'>Material Icons</Link>
        {materialIcon('soup-kitchen')}
        {materialIcon('night-shelter')}
        {materialIcon('person-search')}
        {materialIcon('home')}
        {materialIcon('favorite')}
        {materialIcon('settings')}
        {materialIcon('search')}
        {materialIcon('person')}
        {materialIcon('shopping-cart')}
        {materialIcon('add-shopping-cart')}
        {materialIcon('shop')}
        {materialIcon('shop-two')}
      </ScrollView>
  );
}

function ionIcon(name: keyof typeof Ionicons.glyphMap) {
  return (
    <View style={styles.iconRow}>
      <Ionicons name={name} size={24} color="black" />
      <ThemedText> {name}</ThemedText>
    </View>
  );
}

function materialIcon(name: keyof typeof MaterialIcons.glyphMap) {
  return (
    <View style={styles.iconRow}>
      <MaterialIcons name={name} size={24} color="black" />
      <ThemedText> {name}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
});