import { Tabs } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToSettingsChanges, currentSettings } from '@/storage/settings';
import { TAB_DEFINITIONS, getTabProperties } from '@/constants/TabConfig';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [settings, setSettings] = useState(currentSettings());
  const [isLayoutMounted, setIsLayoutMounted] = useState(false);

  // Set layout as mounted after first render
  useEffect(() => {
    setIsLayoutMounted(true);
  }, []);

  // Subscribe to settings changes
  useEffect(() => {
    const unsubscribe = subscribeToSettingsChanges((newSettings) => {
      setSettings({...newSettings});
    });

    return () => unsubscribe();
  }, []);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>
        {TAB_DEFINITIONS.map(tab => {
          const { title, icon } = getTabProperties(tab, settings.UI_Level);
          const customTitle = settings.tabRenames?.[tab.name];
          let isVisible = tab.alwaysVisible;
          if (!isVisible) {
            const tabLevel = settings.tabLevels?.[tab.name] ?? tab.uiLevel;
            isVisible = tabLevel <= settings.UI_Level;
          }

          return (
            <Tabs.Screen
              key={tab.name}
              name={tab.name}
              options={{
                title: customTitle || title,
                tabBarIcon: ({ color }) => <Ionicons name={icon as any} size={24} color={color} />,
                href: isVisible ? undefined : null,
              }}
            />
          );
        })}
    </Tabs>
  );
}