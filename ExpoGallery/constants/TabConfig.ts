import { Ionicons } from '@expo/vector-icons';

export interface TabVariant {
  uiLevel: number;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export interface TabDefinition {
  name: string;
  title?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  uiLevel: number;
  variants?: TabVariant[];
  defaultTitle?: string;
  defaultIcon?: keyof typeof Ionicons.glyphMap;
  alwaysVisible?: boolean;
}

// Single source of truth for all tab configurations
export const TAB_DEFINITIONS: TabDefinition[] = [
  {
    name: 'index',
    variants: [
      { uiLevel: 1, title: 'Support',      icon: 'information-circle-outline' },
      { uiLevel: 2, title: 'Intermediate', icon: 'rocket-outline' },
      { uiLevel: 3, title: 'Advanced',     icon: 'diamond-outline' }
    ],
    defaultTitle: 'Home',
    defaultIcon: 'home-outline',
    uiLevel: 1,
    alwaysVisible: true
  },
  { name: 'explore',   title: 'Explore',   icon: 'airplane',              uiLevel: 3 },
  { name: 'focus',     title: 'Focus',     icon: 'search-outline',        uiLevel: 2 },
  { name: 'gallery',   title: 'Gallery',   icon: 'albums',                uiLevel: 3 },
  { name: 'map',       title: 'Map',       icon: 'map-outline',           uiLevel: 1 },
  { name: 'resources', title: 'Resources', icon: 'book-outline',          uiLevel: 1 },
  { name: 'chat',      title: 'Chat',      icon: 'chatbubble-outline',    uiLevel: 1 },
  { name: 'profile',   title: 'Profile',   icon: 'person-outline',        uiLevel: 1 },
  { name: 'log',       title: 'Log',       icon: 'document-text-outline', uiLevel: 3 },
  {
    name: 'settings',
    title: 'Settings',
    icon: 'settings-outline',
    uiLevel: 1,
    alwaysVisible: true
  },
];

// Helper function to get customizable tabs (excludes alwaysVisible tabs)
export const getCustomizableTabs = (): TabDefinition[] => {
  return TAB_DEFINITIONS.filter(tab => !tab.alwaysVisible);
};

// Helper function to get tab properties based on UI level
export const getTabProperties = (tab: TabDefinition, currentUILevel: number) => {
  if (tab.variants) {
    // Find the highest matching variant for current UI level
    const matchingVariant = [...tab.variants]
      .reverse()
      .find(variant => variant.uiLevel <= currentUILevel);

    return {
      title: matchingVariant?.title ?? tab.defaultTitle ?? tab.title ?? tab.name,
      icon: matchingVariant?.icon ?? tab.defaultIcon ?? tab.icon
    };
  }
  return { title: tab.title ?? tab.name, icon: tab.icon };
};