import { oneButtonAlert } from './alerts';
import { settings } from '@/storage/settings';

export interface LogEntry {
  index: number;
  timestamp: number;
  message: string;
  error?: any;
}

export const LOG: LogEntry[] = [];

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

// Notify subscribers when log changes
function notifySubscribers() {
  subscribers.forEach(callback => callback([...LOG]));
}

export interface ItemProps {
  index: number;
  timestamp: number;
  message: string;
  error?: any;
}

export function info(message: string) {
  console.log(message);
  LOG.push({
    index: LOG.length,
    timestamp: Date.now(),
    message
  });
  notifySubscribers();
}

export function error(message: string, error: any) {
  console.error(message, error);
  LOG.push({
    index: LOG.length,
    timestamp: Date.now(),
    message,
    error
  });
  notifySubscribers();
  if (settings.debug) {
    oneButtonAlert(message);
  }
}