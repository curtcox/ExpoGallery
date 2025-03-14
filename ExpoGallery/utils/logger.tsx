import { Alert, Platform} from 'react-native';

// Import just the types without creating a circular dependency
import type { Settings } from '@/storage/settings';

export interface LogEntry {
  index: number;
  timestamp: number;
  message: string;
  level: 'info' | 'warn' | 'error';
  error?: any;
}

export const LOG: LogEntry[] = [];

// Just like in alerts.tsx, but this way there is no import cycle
const handlePress = (buttonType: string) => {
  const message = `${buttonType} Pressed`;
  info(message);
};

const oneButtonAlert = (message: string) => {
  if (Platform.OS === 'web') {
    window.alert(message);
    handlePress('OK');
  } else {
    Alert.alert('Alert Title', message, [
      {text: 'OK', onPress: () => handlePress('OK')},
    ]);
  }
};

let DEBUG = false;

export function getDebugMode() {
  return DEBUG;
}

export function setDebugMode(value: boolean) {
  DEBUG = value;
  // Log debug mode change if we're now in debug mode
  if (DEBUG) {
    info(`Debug mode ${DEBUG ? 'enabled' : 'disabled'}`);
  }
}

// Function to initialize debug mode from settings without creating an import cycle
export function initializeDebugMode(settings: { debug: boolean }) {
  DEBUG = settings.debug;
}

// Add subscribers mechanism
const subscribers: Set<(logs: LogEntry[]) => void> = new Set();

export function subscribeToLogs(callback: (logs: LogEntry[]) => void) {
  subscribers.add(callback);
  // Initial call with current logs
  callback([...LOG]);

  // Return unsubscribe function
  return () => {
    subscribers.delete(callback);
  };
}

function notifySubscribersLater() {
  // This prevents React errors when logging happens during render
  setTimeout(() => {
    subscribers.forEach(callback => callback([...LOG]));
  }, 0);
}

// Notify subscribers when log changes
function notifySubscribers() {
  notifySubscribersLater();
}

export interface ItemProps {
  index: number;
  timestamp: number;
  message: string;
  level: 'info' | 'warn' | 'error';
  error?: any;
}

export function info(message: string) {
  console.log(message);
  LOG.push({
    index: LOG.length,
    timestamp: Date.now(),
    message,
    level: 'info'
  });
  notifySubscribers();
}

export function warn(message: string) {
  console.warn(message);
  LOG.push({
    index: LOG.length,
    timestamp: Date.now(),
    message,
    level: 'warn'
  });
  notifySubscribers();
}

export function error(message: string, error: any) {
  console.error(message, error);
  LOG.push({
    index: LOG.length,
    timestamp: Date.now(),
    message,
    level: 'error',
    error
  });
  notifySubscribers();
  if (DEBUG) {
    oneButtonAlert(message);
  }
}