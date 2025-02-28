import { Tabs, useSegments, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
import { subscribeToSettingsChanges, currentSettings } from '@/storage/settings';

// Define tab configurations with UI levels and variants
const tabConfigurations = [
  {
    name: 'index',
    variants: [
      { uiLevel: 1, title: 'Basic',        icon: 'home-outline' },
      { uiLevel: 2, title: 'Intermediate', icon: 'rocket-outline' },
      { uiLevel: 3, title: 'Advanced',     icon: 'diamond-outline' }
    ],
    defaultTitle: 'Home',
    defaultIcon: 'home-outline',
    uiLevel: 1
  },
  { name: 'explore',  title: 'Explore',  icon: 'airplane',           uiLevel: 3 },
  { name: 'focus',    title: 'Focus',    icon: 'search-outline',     uiLevel: 2 },
  { name: 'gallery',  title: 'Gallery',  icon: 'albums',             uiLevel: 3 },
  { name: 'map',      title: 'Map',      icon: 'map-outline',        uiLevel: 1 },
  { name: 'chat',     title: 'Chat',     icon: 'chatbubble-outline', uiLevel: 1 },
  { name: 'settings', title: 'Settings', icon: 'settings-outline',   uiLevel: 1 },
  { name: 'profile',  title: 'Profile',  icon: 'person-outline',     uiLevel: 1 },
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

  // Filter tabs based on UI level and custom tab levels
  const visibleTabs = tabConfigurations.filter(tab => {
    // Index and settings are always visible
    if (tab.name === 'index' || tab.name === 'settings') {
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

  // Helper function to get tab properties based on UI level
  const getTabProperties = (tab: typeof tabConfigurations[0]) => {
    if ('variants' in tab && tab.variants) {
      // Find the highest matching variant for current UI level
      const matchingVariant = [...tab.variants]
        .reverse()
        .find(variant => variant.uiLevel <= settings.UI_Level);

      return {
        title: matchingVariant?.title ?? tab.defaultTitle,
        icon: matchingVariant?.icon ?? tab.defaultIcon
      };
    }
    return { title: tab.title, icon: tab.icon };
  };

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
        {tabConfigurations.map(tab => {
          const { title, icon } = getTabProperties(tab);

          // Determine if tab should be visible based on custom settings
          let isVisible = true;
          if (tab.name !== 'index' && tab.name !== 'settings') {
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