import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, ScrollView, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { updateSettings, subscribeToSettingsChanges, settings } from '@/storage/settings';
import { Ionicons } from '@expo/vector-icons';
import { getCustomizableTabs, TAB_DEFINITIONS } from '@/constants/TabConfig';

// Update the updateSettings function to persist changes
export default function SettingsScreen() {
  const [uiLevel, setUiLevel] = useState(settings.UI_Level);
  const [debug, setDebug] = useState(settings.debug);
  const [tabLevels, setTabLevels] = useState<Record<string, number>>({});

  const handleUILevelChange = (level: number) => {
    setUiLevel(level);
    updateSettings({ UI_Level: level });
  };

  const toggleDebug = () => {
    const newDebug = !debug;
    setDebug(newDebug);
    updateSettings({ debug: newDebug });
  };

  const handleTabLevelChange = (tabName: string, level: number) => {
    const newTabLevels = { ...tabLevels, [tabName]: level };
    setTabLevels(newTabLevels);
    updateSettings({ tabLevels: newTabLevels });
  };

  // Load settings when component mounts
  useEffect(() => {
    const unsubscribe = subscribeToSettingsChanges((newSettings) => {
      setUiLevel(newSettings.UI_Level);
      setDebug(newSettings.debug);
      setTabLevels(newSettings.tabLevels || {});
    });

    return unsubscribe;
  }, []);

  // Initialize tab levels from settings or defaults
  useEffect(() => {
    const initialTabLevels: Record<string, number> = {};
    getCustomizableTabs().forEach(tab => {
      initialTabLevels[tab.name] = settings.tabLevels?.[tab.name] || tab.uiLevel;
    });

    if (!settings.tabLevels) {
      updateSettings({ tabLevels: initialTabLevels });
    }

    setTabLevels(settings.tabLevels || initialTabLevels);
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
        <ThemedText type="subtitle">Tab Visibility Settings</ThemedText>
        <ThemedText type="default">Set the minimum UI level required to see each tab</ThemedText>

        {getCustomizableTabs().map(tab => (
          <View key={tab.name} style={styles.tabLevelOption}>
            <View style={styles.tabInfo}>
              <Ionicons name={tab.icon as any} size={20} style={styles.tabIcon} />
              <ThemedText type="default">{tab.title}</ThemedText>
            </View>

            <View style={styles.tabLevelButtons}>
              {[1, 2, 3].map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelButton,
                    tabLevels[tab.name] === level && styles.selectedLevelButton
                  ]}
                  onPress={() => handleTabLevelChange(tab.name, level)}
                >
                  <ThemedText
                    type="default"
                    style={tabLevels[tab.name] === level ? styles.selectedLevelText : {}}
                  >
                    {level}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        <ThemedText type="default" style={styles.note}>
          Note: Home and Settings tabs are always visible
        </ThemedText>
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
          Visible tabs: {getVisibleTabsDescription(uiLevel, tabLevels)}
        </ThemedText>
      </View>
    </ScrollView>
  );
}

function getVisibleTabsDescription(level: number, tabLevels: Record<string, number>): string {
  // Get tabs that are always visible
  const alwaysVisibleTabs = TAB_DEFINITIONS
    .filter(tab => tab.alwaysVisible)
    .map(tab => tab.title ?? tab.name);

  // Get tabs visible at current UI level
  const visibleCustomTabs = getCustomizableTabs()
    .filter(tab => tabLevels[tab.name] <= level)
    .map(tab => tab.title ?? tab.name);

  const allVisibleTabs = [...alwaysVisibleTabs, ...visibleCustomTabs];

  return allVisibleTabs.join(", ");
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
  tabLevelOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.2)',
  },
  tabInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  tabIcon: {
    marginRight: 8,
  },
  tabLevelButtons: {
    flexDirection: 'row',
  },
  levelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  selectedLevelButton: {
    backgroundColor: 'rgba(100, 100, 255, 0.2)',
    borderColor: 'rgba(100, 100, 255, 0.5)',
  },
  selectedLevelText: {
    fontWeight: 'bold',
  },
  note: {
    marginTop: 16,
    fontStyle: 'italic',
    opacity: 0.7,
  },
});