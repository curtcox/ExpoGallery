import React, { useState } from 'react';
import { View, StyleSheet, Switch, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

// Settings singleton
let settings = {
  debug: true,
  UI_Level: 1,
};

// Subscribers to settings changes
const subscribers = new Set<(settings: typeof settings) => void>();

export function currentSettings() {
  return settings;
}

export function updateSettings(newSettings: Partial<typeof settings>) {
  settings = { ...settings, ...newSettings };

  // Notify all subscribers
  subscribers.forEach(callback => callback(settings));

  return settings;
}

export function subscribeToSettingsChanges(callback: (settings: typeof settings) => void) {
  subscribers.add(callback);

  // Return unsubscribe function
  return () => {
    subscribers.delete(callback);
  };
}

export default function SettingsScreen() {
  const [uiLevel, setUiLevel] = useState(settings.UI_Level);
  const [debug, setDebug] = useState(settings.debug);

  const handleUILevelChange = (level: number) => {
    setUiLevel(level);
    updateSettings({ UI_Level: level });
  };

  const toggleDebug = () => {
    const newDebug = !debug;
    setDebug(newDebug);
    updateSettings({ debug: newDebug });
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Settings</ThemedText>

      <View style={styles.section}>
        <ThemedText type="subtitle">UI Complexity Level</ThemedText>
        <ThemedText type="body">Controls which features are visible in the app</ThemedText>

        <View style={styles.levelContainer}>
          {[1, 2, 3].map(level => (
            <View key={level} style={styles.levelOption}>
              <ThemedText
                type="body"
                style={uiLevel === level ? styles.selectedLevel : {}}
              >
                Level {level}
              </ThemedText>
              <Switch
                value={uiLevel === level}
                onValueChange={() => handleUILevelChange(level)}
              />
              <ThemedText type="caption">
                {level === 1 ? 'Basic' : level === 2 ? 'Intermediate' : 'Advanced'}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Developer Options</ThemedText>
        <View style={styles.option}>
          <ThemedText type="body">Debug Mode</ThemedText>
          <Switch value={debug} onValueChange={toggleDebug} />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="caption">
          Current UI Level: {uiLevel} {debug ? '(Debug Mode On)' : ''}
        </ThemedText>
        <ThemedText type="caption">
          Visible tabs: {getVisibleTabsDescription(uiLevel)}
        </ThemedText>
      </View>
    </ScrollView>
  );
}

function getVisibleTabsDescription(level: number): string {
  if (level === 1) return "Home, Focus, Gallery, Settings";
  if (level === 2) return "Home, Explore, Focus, Gallery, Map, Settings, Profile";
  return "All tabs";
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
  },
  levelContainer: {
    marginTop: 16,
  },
  levelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.2)',
  },
  selectedLevel: {
    fontWeight: 'bold',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
});