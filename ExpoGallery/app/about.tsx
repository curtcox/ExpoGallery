import React from 'react';
import { View, StyleSheet, ScrollView,  Linking } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function AboutScreen() {
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'About', headerLargeTitle: true }} />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="cube" size={60} color="#2196F3" />
        </View>
        <ThemedText type="title" style={styles.appName}>ExpoGallery</ThemedText>
        <ThemedText type="default" style={styles.version}>Version 1.0.0</ThemedText>
        <ThemedText type="default" style={styles.buildInfo}>Build: __GIT_SHA__</ThemedText>
        <ThemedText type="default" style={styles.buildInfo}>Date: __BUILD_DATE__</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">About ExpoGallery</ThemedText>
        <ThemedText type="default" style={styles.description}>
          ExpoGallery is a showcase of React Native and Expo features, demonstrating
          options for mobile app development. This app serves as both
          a reference and a playground for developers.
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Features</ThemedText>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={24} color="#2196F3" style={styles.featureIcon} />
          <ThemedText type="default" style={styles.featureText}>
            Customizable UI levels
          </ThemedText>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={24} color="#2196F3" style={styles.featureIcon} />
          <ThemedText type="default" style={styles.featureText}>
            Adaptive tab navigation
          </ThemedText>
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Contact & Support</ThemedText>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => Linking.openURL('https://github.com/curtcox/ExpoGallery')}
        >
          <View style={styles.linkContent}>
            <Ionicons name="logo-github" size={24} color="#2196F3" style={styles.linkIcon} />
            <ThemedText type="default">GitHub Repository</ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <ThemedText type="default" style={styles.copyright}>
          © {new Date().getFullYear()} ExpoGallery. All rights reserved.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 30,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    backgroundColor: 'rgba(33, 150, 243, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  version: {
    opacity: 0.6,
  },
  buildInfo: {
    fontSize: 12,
    opacity: 0.5,
    fontFamily: 'monospace',
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
  },
  description: {
    lineHeight: 22,
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  featureIcon: {
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  linkButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.2)',
    borderRadius: 8,
    marginTop: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    marginRight: 12,
  },
  footer: {
    marginTop: 16,
    marginBottom: 40,
    alignItems: 'center',
  },
  copyright: {
    opacity: 0.6,
    fontSize: 12,
  },
});