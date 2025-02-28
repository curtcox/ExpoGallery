import { error, storage } from '@/utils/index';

// Define settings type to fix circular reference
export type Settings = {
  debug: boolean;
  UI_Level: number;
};

// Initialize settings with default values
export let settings: Settings = {
  debug: true,
  UI_Level: 1,
};

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