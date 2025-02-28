export interface LogEntry {
  index: number;
  timestamp: number;
  message: string;
  error?: any;
}

export const LOG: LogEntry[] = [];

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
  }

  export function error(message: string, error: any) {
    console.error(message, error);
    LOG.push({
      index: LOG.length,
      timestamp: Date.now(),
      message,
      error
    });
  }