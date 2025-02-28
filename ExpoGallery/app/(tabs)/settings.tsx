import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, ScrollView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { updateSettings, subscribeToSettingsChanges, settings } from '@/storage/settings';

// Update the updateSettings function to persist changes
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

  // Load settings when component mounts
  useEffect(() => {
    const unsubscribe = subscribeToSettingsChanges((newSettings) => {
      setUiLevel(newSettings.UI_Level);
      setDebug(newSettings.debug);
    });

    return unsubscribe;
  }, []);

  return (
    <ScrollView style={styles.container}>
      <ThemedText type="title" style={styles.header}>Settings</ThemedText>

      <View style={styles.section}>
        <ThemedText type="subtitle">UI Complexity Level</ThemedText>
        <ThemedText type="default">Controls which features are visible in the app</ThemedText>

        <View style={styles.levelContainer}>
          {[1, 2, 3].map(level => (
            <View key={level} style={styles.levelOption}>
              <ThemedText
                type="default"
                style={uiLevel === level ? styles.selectedLevel : {}}
              >
                Level {level}
              </ThemedText>
              <Switch
                value={uiLevel === level}
                onValueChange={() => handleUILevelChange(level)}
              />
              <ThemedText type="default">
                {level === 1 ? 'Basic' : level === 2 ? 'Intermediate' : 'Advanced'}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Developer Options</ThemedText>
        <View style={styles.option}>
          <ThemedText type="default">Debug Mode</ThemedText>
          <Switch value={debug} onValueChange={toggleDebug} />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText type="default">
          Current UI Level: {uiLevel} {debug ? '(Debug Mode On)' : ''}
        </ThemedText>
        <ThemedText type="default">
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