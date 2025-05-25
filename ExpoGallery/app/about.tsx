import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking, ActivityIndicator, Platform } from 'react-native';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler';
import { error } from '@/utils/logger';
import appConfig from '../app.config.js';

// Current version of the app
const APP_VERSION = appConfig.expo.version;
const APP_BUILD_SHA: string = appConfig.expo.extra.gitSha;
const APP_BUILD_DATE: string = appConfig.expo.extra.buildDate;

export default function AboutScreen() {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [latestBuildSha, setLatestBuildSha] = useState<string | null>(null);
  const [isCheckingVersion, setIsCheckingVersion] = useState(false);
  const [versionCheckError, setVersionCheckError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  // Function to check for the latest version
  const checkForUpdates = async () => {
    setIsCheckingVersion(true);
    setVersionCheckError(null);
    let versionUrl = '';

    try {
      // Determine the correct path to version.json based on platform

      if (Platform.OS === 'web') {
        // For web, use a relative path that works with the base URL
        const baseUrl = window.location.origin;
        const basePath = appConfig.expo.experiments?.baseUrl || '';
        versionUrl = `${baseUrl}${basePath}/version.json`;
      } else {
        // For native, we'll use a mock response to show current values
        // In a real app, you might want to fetch from a remote API endpoint
        setLatestVersion(APP_VERSION);
        setLatestBuildSha(APP_BUILD_SHA);
        setLastChecked(new Date());
        setIsCheckingVersion(false);
        return;
      }

      const response = await fetch(versionUrl, {
        headers: { 'Cache-Control': 'no-cache' },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch version info: ${response.status}`);
      }

      const data = await response.json();
      setLatestVersion(data.version);
      setLatestBuildSha(data.build);
      setLastChecked(new Date());
    } catch (e) {
      error(`Error checking for ${versionUrl}, updates:`, e);
      setVersionCheckError(`Could not check for updates at ${versionUrl}`);
    } finally {
      setIsCheckingVersion(false);
    }
  };

  // Check for updates on component mount and periodically
  useEffect(() => {
    // Initial check
    checkForUpdates();

    // Check every 10 minutes
    const intervalId = setInterval(checkForUpdates, 10 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Determine if the app is up to date - check both version and build SHA
  const isUpToDate = latestVersion === APP_VERSION && (
    APP_BUILD_SHA === 'development' || latestBuildSha === APP_BUILD_SHA
  );

  const renderAppHeader = () => (
    <View style={styles.header}>
      <View style={styles.logoContainer}>
        <Ionicons name="cube" size={60} color="#2196F3" />
      </View>
      <ThemedText type="title" style={styles.appName}>ExpoGallery</ThemedText>
      <ThemedText type="default" style={styles.version}>Version {APP_VERSION}</ThemedText>

      {renderVersionCheck()}

      <ThemedText type="default" style={styles.buildInfo}>Build: {APP_BUILD_SHA}</ThemedText>
      <ThemedText type="default" style={styles.buildInfo}>Date: {APP_BUILD_DATE}</ThemedText>
    </View>
  );

  const renderVersionCheck = () => (
    <View style={styles.versionCheckContainer}>
      {isCheckingVersion ? (
        <View style={styles.versionCheck}>
          <ActivityIndicator size="small" color="#2196F3" />
          <ThemedText type="default" style={styles.versionCheckText}>Checking for updates...</ThemedText>
        </View>
      ) : versionCheckError ? (
        <ThemedText type="default" style={styles.versionError}>{versionCheckError}</ThemedText>
      ) : latestVersion ? (
        renderVersionInfo()
      ) : null}
    </View>
  );

  const renderVersionInfo = () => (
    <View style={styles.versionInfoContainer}>
      {isUpToDate ? (
        <ThemedText type="default" style={styles.upToDate}>
          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" /> Build up to date
        </ThemedText>
      ) : (
        <ThemedText type="default" style={styles.updateAvailable}>
          <Ionicons name="arrow-up-circle" size={16} color="#FFC107" /> Update available: {latestVersion}
        </ThemedText>
      )}

      <View style={styles.infoGrid}>
        {renderVersionInfoRow('Current Version:', APP_VERSION)}
        {renderVersionInfoRow('Latest Version:', latestVersion)}
        {renderVersionInfoRow('Current Build:', APP_BUILD_SHA)}
        {renderVersionInfoRow('Latest Build:', latestBuildSha)}
        {renderVersionInfoRow('Build Date:', APP_BUILD_DATE)}
        {lastChecked && renderVersionInfoRow('Last Checked:', lastChecked.toLocaleTimeString())}
      </View>

      {!isUpToDate && (
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/reset')}
        >
          <View style={styles.linkContent}>
            <ThemedText type="default" style={styles.linkText}>Reset Screen</ThemedText>
            <Ionicons name="arrow-forward" size={16} color="#2196F3" style={styles.linkIcon} />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderVersionInfoRow = (label: string, value: string | null) => (
    <View style={styles.infoRow}>
      <ThemedText type="default" style={styles.infoLabel}>{label}</ThemedText>
      <ThemedText type="default" style={styles.infoValue}>{value}</ThemedText>
    </View>
  );

  const renderAboutSection = () => (
    <View style={styles.section}>
      <ThemedText type="subtitle">About ExpoGallery</ThemedText>
      <ThemedText type="default" style={styles.description}>
        ExpoGallery is a showcase of React Native and Expo features, demonstrating
        options for mobile app development. This app serves as both
        a reference and a playground for developers.
      </ThemedText>
    </View>
  );

  const renderFeaturesSection = () => (
    <View style={styles.section}>
      <ThemedText type="subtitle">Features</ThemedText>
      {renderFeatureItem('Customizable UI levels')}
      {renderFeatureItem('Adaptive tab navigation')}
    </View>
  );

  const renderFeatureItem = (text: string) => (
    <View style={styles.featureItem}>
      <Ionicons name="checkmark-circle" size={24} color="#2196F3" style={styles.featureIcon} />
      <ThemedText type="default" style={styles.featureText}>
        {text}
      </ThemedText>
    </View>
  );

  const renderContactSection = () => (
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
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      <ThemedText type="default" style={styles.copyright}>
        © {new Date().getFullYear()} ExpoGallery. All rights reserved.
      </ThemedText>
    </View>
  );

  return (
    <GestureHandlerRootView>
      <ScrollView style={styles.container}>
        <Stack.Screen options={{ title: 'About', headerLargeTitle: true }} />
        {renderAppHeader()}
        {renderAboutSection()}
        {renderFeaturesSection()}
        {renderContactSection()}
        {renderFooter()}
      </ScrollView>
    </GestureHandlerRootView>
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
  versionCheckContainer: {
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
    minHeight: 40,
    width: '100%',
    maxWidth: 400,
  },
  versionInfoContainer: {
    width: '100%',
    alignItems: 'center',
  },
  infoGrid: {
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  infoLabel: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    opacity: 0.7,
  },
  infoValue: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    textAlign: 'right',
  },
  versionCheck: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  versionCheckText: {
    fontSize: 12,
    marginLeft: 8,
  },
  upToDate: {
    color: '#4CAF50',
    fontSize: 12,
    textAlign: 'center',
  },
  updateAvailable: {
    color: '#FFC107',
    fontSize: 12,
    textAlign: 'center',
  },
  versionError: {
    color: '#F44336',
    fontSize: 12,
    textAlign: 'center',
  },
  lastChecked: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 4,
    textAlign: 'center',
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
    padding: 0,
    marginTop: 12,
    backgroundColor: 'transparent',
  },
  linkContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  linkIcon: {
    marginRight: 8,
  },
  linkText: {
    color: '#2196F3',
    textDecorationLine: 'underline',
    fontSize: 14,
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