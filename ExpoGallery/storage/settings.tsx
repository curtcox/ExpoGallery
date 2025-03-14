import { error, storage } from '@/utils/index';

export interface Settings {
  UI_Level: number;
  tabLevels?: Record<string, number>;
  tabRenames?: Record<string, string>;
  focusedExamples: string[];
  overrides?: string; // JSON string containing custom overrides
}

// Default settings
export const defaultSettings: Settings = {
  UI_Level: 1,
  tabLevels: {},
  tabRenames: {},
  focusedExamples: [],
  overrides: '',
};

// Current settings (in memory)
export let settings: Settings = { ...defaultSettings };

// Call loadSettings when the module is loaded
loadSettings();

// Update subscribers type
const subscribers = new Set<(settings: Settings) => void>();

// Load settings from storage on startup
export async function loadSettings() {
  try {
    const storedSettings = await storage.getItem('settings');
    if (storedSettings) {
      settings = { ...settings, ...JSON.parse(storedSettings) };
      // Notify subscribers of loaded settings
      subscribers.forEach(callback => callback(settings));
    }
  } catch (e) {
    error('Failed to load settings:', e);
  }
}

export function currentSettings() {
  return settings;
}

// Update the updateSettings function to persist changes
export async function updateSettings(newSettings: Partial<Settings>) {
  settings = { ...settings, ...newSettings };

  // Persist to storage
  try {
    await storage.setItem('settings', JSON.stringify(settings));
  } catch (e) {
    error('Failed to save settings:', e);
  }

  // Notify all subscribers
  subscribers.forEach(callback => callback(settings));

  return settings;
}

export function subscribeToSettingsChanges(callback: (settings: Settings) => void) {
  subscribers.add(callback);

  // Return unsubscribe function
  return () => {
    subscribers.delete(callback);
  };
}