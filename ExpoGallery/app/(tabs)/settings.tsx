import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Switch, ScrollView, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { updateSettings, subscribeToSettingsChanges, settings } from '@/storage/settings';
import { Ionicons } from '@expo/vector-icons';
import { getCustomizableTabs, TAB_DEFINITIONS } from '@/constants/TabConfig';
import { getDebugMode, setDebugMode } from '@/utils/logger';

// Update the updateSettings function to persist changes
export default function SettingsScreen() {
  const [uiLevel, setUiLevel] = useState(settings.UI_Level);
  const [debug, setDebug] = useState(getDebugMode());
  const [tabLevels, setTabLevels] = useState<Record<string, number>>({});
  const [tabRenames, setTabRenames] = useState<Record<string, string>>({});
  const [editingTabName, setEditingTabName] = useState<string | null>(null);

  const handleUILevelChange = (level: number) => {
    setUiLevel(level);
    updateSettings({ UI_Level: level });
  };

  const toggleDebug = () => {
    const newDebug = !debug;
    setDebug(newDebug);
    setDebugMode(newDebug);
  };

  const handleTabLevelChange = (tabName: string, level: number) => {
    const newTabLevels = { ...tabLevels, [tabName]: level };
    setTabLevels(newTabLevels);
    updateSettings({ tabLevels: newTabLevels });
  };

  const handleTabNameChange = (tabName: string, newTitle: string) => {
    // If empty string is provided, remove the custom title (revert to default)
    const newTabRenames = { ...tabRenames };

    if (newTitle.trim() === '') {
      delete newTabRenames[tabName];
    } else {
      newTabRenames[tabName] = newTitle.trim();
    }

    setTabRenames(newTabRenames);
    updateSettings({ tabRenames: newTabRenames });
    setEditingTabName(null);
    Keyboard.dismiss();
  };

  // Load settings when component mounts
  useEffect(() => {
    setDebug(getDebugMode());
    const unsubscribe = subscribeToSettingsChanges((newSettings) => {
      setUiLevel(newSettings.UI_Level);
      setTabLevels(newSettings.tabLevels || {});
      setTabRenames(newSettings.tabRenames || {});
    });

    return unsubscribe;
  }, []);

  // Initialize tab levels and renames from settings or defaults
  useEffect(() => {
    const initialTabLevels: Record<string, number> = {};
    getCustomizableTabs().forEach(tab => {
      initialTabLevels[tab.name] = settings.tabLevels?.[tab.name] || tab.uiLevel;
    });

    if (!settings.tabLevels) {
      updateSettings({ tabLevels: initialTabLevels });
    }

    setTabLevels(settings.tabLevels || initialTabLevels);
    setTabRenames(settings.tabRenames || {});
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
        <ThemedText type="subtitle">Custom Tab Names</ThemedText>
        <ThemedText type="default">Customize the tab titles shown in the navigation bar</ThemedText>

        {TAB_DEFINITIONS.map(tab => {
          const defaultTitle = tab.title || tab.name;
          const currentTitle = tabRenames[tab.name] || defaultTitle;
          const isEditing = editingTabName === tab.name;

          return (
            <View key={tab.name} style={styles.tabRenameOption}>
              <View style={styles.tabInfo}>
                <Ionicons name={tab.icon as any} size={20} style={styles.tabIcon} />
                {isEditing ? (
                  <TextInput
                    style={styles.tabNameInput}
                    value={tabRenames[tab.name] || ''}
                    placeholder={defaultTitle}
                    placeholderTextColor="rgba(150, 150, 150, 0.8)"
                    onChangeText={(text) => {
                      const newTabRenames = { ...tabRenames, [tab.name]: text };
                      setTabRenames(newTabRenames);
                    }}
                    onBlur={() => handleTabNameChange(tab.name, tabRenames[tab.name] || '')}
                    onSubmitEditing={() => handleTabNameChange(tab.name, tabRenames[tab.name] || '')}
                    autoFocus
                  />
                ) : (
                  <ThemedText type="default">
                    {currentTitle}
                    {tabRenames[tab.name] &&
                      <ThemedText type="default" style={styles.customLabel}> (custom)</ThemedText>
                    }
                  </ThemedText>
                )}
              </View>

              <View style={styles.tabRenameActions}>
                {isEditing ? (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleTabNameChange(tab.name, tabRenames[tab.name] || '')}
                    >
                      <Ionicons name="checkmark" size={20} color="#4CAF50" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        setEditingTabName(null);
                        // Revert to previous value
                        setTabRenames({ ...tabRenames });
                      }}
                    >
                      <Ionicons name="close" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => setEditingTabName(tab.name)}
                    >
                      <Ionicons name="pencil" size={20} color="#2196F3" />
                    </TouchableOpacity>
                    {tabRenames[tab.name] && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleTabNameChange(tab.name, '')}
                      >
                        <Ionicons name="refresh" size={20} color="#9E9E9E" />
                      </TouchableOpacity>
                    )}
                  </>
                )}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">Developer Options</ThemedText>
        <View style={styles.option}>
          <ThemedText type="default">Debug Mode</ThemedText>
          <Switch value={debug} onValueChange={toggleDebug} />
        </View>

        <TouchableOpacity
          style={styles.overridesLink}
          onPress={() => {
            // Navigate to services screen
            const { router } = require('expo-router');
            router.navigate('/services');
          }}
        >
          <View style={styles.linkContent}>
            <ThemedText type="default">Services Configuration</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#2196F3" />
          </View>
          <ThemedText type="default" style={styles.linkDescription}>
            Configure chat and other service settings
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.overridesLink}
          onPress={() => {
            // Navigate to overrides screen
            const { router } = require('expo-router');
            router.navigate('/overrides');
          }}
        >
          <View style={styles.linkContent}>
            <ThemedText type="default">App Overrides</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#2196F3" />
          </View>
          <ThemedText type="default" style={styles.linkDescription}>
            Edit advanced configuration overrides
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.overridesLink}
          onPress={() => {
            const { router } = require('expo-router');
            router.navigate('/reset');
          }}
        >
          <View style={styles.linkContent}>
            <ThemedText type="default">Reset Settings</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#2196F3" />
          </View>
          <ThemedText type="default" style={styles.linkDescription}>
            Reset all settings to default values
          </ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <ThemedText type="default">
          Current UI Level: {uiLevel} {debug ? '(Debug Mode On)' : ''}
        </ThemedText>
        <ThemedText type="default">
          Visible tabs: {getVisibleTabsDescription(uiLevel, tabLevels)}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle">About</ThemedText>
        <TouchableOpacity
          style={styles.overridesLink}
          onPress={() => {
            const { router } = require('expo-router');
            router.navigate('/about');
          }}
        >
          <View style={styles.linkContent}>
            <ThemedText type="default">About ExpoGallery</ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#2196F3" />
          </View>
          <ThemedText type="default" style={styles.linkDescription}>
            View app information and credits
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function getVisibleTabsDescription(level: number, tabLevels: Record<string, number>): string {
  const tabRenames = settings.tabRenames || {};

  // Get tabs that are always visible
  const alwaysVisibleTabs = TAB_DEFINITIONS
    .filter(tab => tab.alwaysVisible)
    .map(tab => tabRenames[tab.name] || tab.title || tab.name);

  // Get tabs visible at current UI level
  const visibleCustomTabs = getCustomizableTabs()
    .filter(tab => tabLevels[tab.name] <= level)
    .map(tab => tabRenames[tab.name] || tab.title || tab.name);

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
  tabRenameOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(200, 200, 200, 0.2)',
  },
  tabNameInput: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.3)',
    color: '#000',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  tabRenameActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  customLabel: {
    fontStyle: 'italic',
    opacity: 0.7,
    fontSize: 12,
  },
  overridesLink: {
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(200, 200, 200, 0.2)',
    borderRadius: 8,
    marginTop: 12,
    backgroundColor: 'rgba(33, 150, 243, 0.05)',
  },
  linkContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkDescription: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.7,
  },
});