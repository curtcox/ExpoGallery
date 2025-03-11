import { error, storage } from '@/utils/index';
import { Resource } from '@/services/data';
import lincolnCounty from '../assets/json/lincoln-county.json';
import stLouisCityCounty from '../assets/json/st-louis-city-county.json';

// Keys for storing resources in storage
const TEMP_RESOURCES_STORAGE_KEY = 'temp_resources';
const RESOURCES_LAST_FETCH_KEY = 'resources_last_fetch';

// Permanent resources from bundled JSON files (never change)
export const permanentResources: Resource[] = [
  ...stLouisCityCounty.resources,
  ...lincolnCounty.resources
];

// Temporary resources (obtained from network, cached in storage)
let temporaryResources: Resource[] = [];
// Last fetch timestamp
let lastFetchTimestamp: number = 0;

// Initialize resources from storage
export async function initResources(): Promise<Resource[]> {
  try {
    // Try to get the last fetch timestamp
    const storedTimestamp = await storage.getItem(RESOURCES_LAST_FETCH_KEY);
    if (storedTimestamp) {
      lastFetchTimestamp = parseInt(storedTimestamp, 10);
    }

    // Try to get stored temporary resources
    const storedResources = await storage.getItem(TEMP_RESOURCES_STORAGE_KEY);
    if (storedResources) {
      temporaryResources = JSON.parse(storedResources) as Resource[];
      notifyResourcesSubscribers();
      return [...permanentResources, ...temporaryResources];
    }

    // If no stored temporary resources, return just the permanent ones
    return [...permanentResources];
  } catch (e) {
    error('Failed to load resources from storage:', e);
    return [...permanentResources];
  }
}

// Update temporary resources with new values from network
export async function updateResources(newTempResources: Resource[]): Promise<void> {
  temporaryResources = newTempResources;
  const now = Date.now();
  lastFetchTimestamp = now;

  try {
    // Save to storage
    await storage.setItem(TEMP_RESOURCES_STORAGE_KEY, JSON.stringify(temporaryResources));
    await storage.setItem(RESOURCES_LAST_FETCH_KEY, now.toString());
    // Notify subscribers
    notifyResourcesSubscribers();
  } catch (e) {
    error('Failed to save temporary resources:', e);
  }
}

// Get all resources (permanent + temporary)
export function getResources(): Resource[] {
  return [...permanentResources, ...temporaryResources];
}

// Get only permanent resources
export function getPermanentResources(): Resource[] {
  return [...permanentResources];
}

// Get only temporary resources
export function getTemporaryResources(): Resource[] {
  return [...temporaryResources];
}

// Get the last fetch timestamp (for temporary resources)
export function getLastFetchTimestamp(): number {
  return lastFetchTimestamp;
}

// Type for resources change callback
type ResourcesChangeCallback = (resources: Resource[]) => void;
// Array to store subscribers
const resourcesSubscribers: ResourcesChangeCallback[] = [];

// Subscribe to resources changes
export function subscribeToResourcesChanges(callback: ResourcesChangeCallback): () => void {
  resourcesSubscribers.push(callback);

  // Call callback immediately with current combined resources
  callback(getResources());

  // Return unsubscribe function
  return () => {
    const index = resourcesSubscribers.indexOf(callback);
    if (index !== -1) {
      resourcesSubscribers.splice(index, 1);
    }
  };
}

// Notify all subscribers of resources changes
function notifyResourcesSubscribers(): void {
  const resourcesCopy = getResources();
  resourcesSubscribers.forEach(callback => {
    try {
      callback(resourcesCopy);
    } catch (e) {
      error('Error in resources subscriber:', e);
    }
  });
}

// Initialize resources when module is imported
initResources().catch(e => error('Failed to initialize resources:', e));