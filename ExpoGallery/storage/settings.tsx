import { error, storage } from '@/utils/index';

export interface Settings {
  UI_Level: number;
  tabLevels?: Record<string, number>;
  tabRenames?: Record<string, string>;
  focusedExamples: string[];
  overrides?: string; // JSON string containing custom overrides
  services?: {
    chat?: {
      external?: boolean;
      timeout?: number;
    }
  }
}

// Default settings
export const defaultSettings: Settings = {
  UI_Level: 1,
  tabLevels: {},
  tabRenames: {},
  focusedExamples: [],
  overrides: '',
  services: {
    chat: {
      external: true,
      timeout: 20000
    }
  }
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

/**
 * Update chat service settings specifically
 * @param external Whether to use external chat service
 * @param timeout Timeout duration for chat responses in milliseconds
 * @returns The updated settings object
 */
export async function updateChatSettings(external?: boolean, timeout?: number) {
  // Create new settings object, preserving any existing values not being updated
  const newSettings: Settings = {
    ...settings,
    services: {
      ...settings.services,
      chat: {
        ...settings.services?.chat,
        ...(external !== undefined ? { external } : {}),
        ...(timeout !== undefined ? { timeout } : {})
      }
    }
  };

  return updateSettings(newSettings);
}

export function subscribeToSettingsChanges(callback: (settings: Settings) => void) {
  subscribers.add(callback);

  // Return unsubscribe function
  return () => {
    subscribers.delete(callback);
  };
}