import { Tabs, useSegments, useRouter } from 'expo-router';
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
  const segments = useSegments();
  const router = useRouter();
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

  // Filter tabs based on UI level and custom tab levels
  const visibleTabs = TAB_DEFINITIONS.filter(tab => {
    // Always visible tabs
    if (tab.alwaysVisible) {
      return true;
    }

    // For other tabs, check custom tab level settings
    const tabLevel = settings.tabLevels?.[tab.name] ?? tab.uiLevel;
    return tabLevel <= settings.UI_Level;
  });

  // Check if current tab is accessible at current UI level
  useEffect(() => {
    // Only run navigation logic after the layout is mounted
    if (!isLayoutMounted) return;

    if (segments.length > 1) {
      const currentTab = segments[1] as string;
      const isTabVisible = visibleTabs.some(tab => tab.name === currentTab);

      // If current tab is not visible at this UI level, redirect to home
      if (!isTabVisible && currentTab !== 'index') {
        router.replace('/');
      }
    }
  }, [segments, settings.UI_Level, visibleTabs, isLayoutMounted]);

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

          // Determine if tab should be visible based on custom settings
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
                title,
                tabBarIcon: ({ color }) => <Ionicons name={icon as any} size={24} color={color} />,
                href: isVisible ? undefined : null,
              }}
            />
          );
        })}
    </Tabs>
  );
}