import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Linking, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { error } from '@/utils/logger';
import appConfig from '@/app.json';
import { Link, useNavigation } from '@react-navigation/native';

// Current version of the app
const APP_VERSION = appConfig.expo.version;
const APP_BUILD_SHA: string = '__GIT_SHA__'; // This will be replaced by set-env.js

export default function AboutScreen() {
  const [latestVersion, setLatestVersion] = useState<string | null>(null);
  const [latestBuildSha, setLatestBuildSha] = useState<string | null>(null);
  const [isCheckingVersion, setIsCheckingVersion] = useState(false);
  const [versionCheckError, setVersionCheckError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const navigation = useNavigation();

  // Function to check for the latest version
  const checkForUpdates = async () => {
    setIsCheckingVersion(true);
    setVersionCheckError(null);

    try {
      // Get base URL from current path
      const baseUrl = window.location.origin;
      const versionUrl = `${baseUrl}/version.json`;

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
      error('Error checking for updates:', e);
      setVersionCheckError('Could not check for updates');
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

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'About', headerLargeTitle: true }} />

      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Ionicons name="cube" size={60} color="#2196F3" />
        </View>
        <ThemedText type="title" style={styles.appName}>ExpoGallery</ThemedText>
        <ThemedText type="default" style={styles.version}>Version {APP_VERSION}</ThemedText>

        {/* Version check status */}
        <View style={styles.versionCheckContainer}>
          {isCheckingVersion ? (
            <View style={styles.versionCheck}>
              <ActivityIndicator size="small" color="#2196F3" />
              <ThemedText type="default" style={styles.versionCheckText}>Checking for updates...</ThemedText>
            </View>
          ) : versionCheckError ? (
            <ThemedText type="default" style={styles.versionError}>{versionCheckError}</ThemedText>
          ) : latestVersion ? (
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
                <View style={styles.infoRow}>
                  <ThemedText type="default" style={styles.infoLabel}>Current Version:</ThemedText>
                  <ThemedText type="default" style={styles.infoValue}>{APP_VERSION}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText type="default" style={styles.infoLabel}>Latest Version:</ThemedText>
                  <ThemedText type="default" style={styles.infoValue}>{latestVersion}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText type="default" style={styles.infoLabel}>Current Build:</ThemedText>
                  <ThemedText type="default" style={styles.infoValue}>{APP_BUILD_SHA}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText type="default" style={styles.infoLabel}>Latest Build:</ThemedText>
                  <ThemedText type="default" style={styles.infoValue}>{latestBuildSha}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText type="default" style={styles.infoLabel}>Build Date:</ThemedText>
                  <ThemedText type="default" style={styles.infoValue}>__BUILD_DATE__</ThemedText>
                </View>
                {lastChecked && (
                  <View style={styles.infoRow}>
                    <ThemedText type="default" style={styles.infoLabel}>Last Checked:</ThemedText>
                    <ThemedText type="default" style={styles.infoValue}>{lastChecked.toLocaleTimeString()}</ThemedText>
                  </View>
                )}
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
          ) : null}
        </View>

        <ThemedText type="default" style={styles.buildInfo}>Build: {APP_BUILD_SHA}</ThemedText>
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