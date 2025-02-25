import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons } from '@expo/vector-icons';
export default function TabLayout() {
  const colorScheme = useColorScheme();

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
        {tabScreen('index',   'Home',    'home')}
        {tabScreen('explore', 'Explore', 'airplane')}
        {tabScreen('focus',   'Focus',   'search')}
        {tabScreen('gallery', 'Gallery', 'albums')}
        {tabScreen('map',     'Map',     'map-outline')}
        {tabScreen('chat',    'Chat',    'chatbubble-outline')}
    </Tabs>
  );
}

function tabScreen(name:string, title: string, icon: string) {
  return (
    <Tabs.Screen
    name={name}
    options={{
      title,
      tabBarIcon: ({ color }) => <Ionicons name={icon} size={24} color="black" />,
    }}
  />
  );
}