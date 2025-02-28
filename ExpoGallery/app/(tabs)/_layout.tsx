import { Tabs, useSegments, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { currentSettings, subscribeToSettingsChanges } from './settings';

// Define tab configurations with UI levels
const tabConfigurations = [
  { name: 'index', title: 'Home', icon: 'home', uiLevel: 1 },
  { name: 'explore', title: 'Explore', icon: 'airplane', uiLevel: 3 },
  { name: 'focus', title: 'Focus', icon: 'search-outline', uiLevel: 2 },
  { name: 'gallery', title: 'Gallery', icon: 'albums', uiLevel: 3 },
  { name: 'map', title: 'Map', icon: 'map-outline', uiLevel: 1 },
  { name: 'chat', title: 'Chat', icon: 'chatbubble-outline', uiLevel: 1 },
  { name: 'settings', title: 'Settings', icon: 'settings-outline', uiLevel: 1 },
  { name: 'profile', title: 'Profile', icon: 'person-outline', uiLevel: 1 },
];

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

  // Filter tabs based on UI level
  const visibleTabs = tabConfigurations.filter(tab => tab.uiLevel <= settings.UI_Level);

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
        {tabConfigurations.map(tab => (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.title,
              tabBarIcon: ({ color }) => <Ionicons name={tab.icon as any} size={24} color={color} />,
              // Hide tabs that exceed the current UI level
              href: tab.uiLevel <= settings.UI_Level ? undefined : null,
            }}
          />
        ))}
    </Tabs>
  );
}