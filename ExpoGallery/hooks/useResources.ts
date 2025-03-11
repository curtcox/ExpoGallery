import { useState, useEffect, useCallback } from 'react';
import {
  getAllResources,
  getAllResourcesSync,
  refreshResources,
  subscribeToResourcesChanges,
  Resource
} from '@/services/data';
import { useNetworkStatus } from '@/utils/network';

/**
 * Hook for accessing resources with the stale-while-revalidate pattern
 *
 * @param options Configuration options
 * @returns Object containing resources, loading state, and refresh function
 */
export function useResources(options: {
  initialFetch?: boolean,  // Should we fetch on mount
  categories?: string[],   // Filter by categories
  networkOnly?: boolean    // Only use network data
} = {}) {
  const { initialFetch = true, categories, networkOnly = false } = options;

  const [resources, setResources] = useState<Resource[]>(() => {
    // Initialize with sync data for immediate rendering
    const initialResources = getAllResourcesSync();
    return categories
      ? initialResources.filter(r => categories.includes(r.category))
      : initialResources;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  // Get network status
  const isConnected = useNetworkStatus();

  // Filter resources by category if needed
  const filterResources = useCallback((allResources: Resource[]) => {
    if (categories && categories.length > 0) {
      return allResources.filter(r => categories.includes(r.category));
    }
    return allResources;
  }, [categories]);

  // Refresh function (for pull-to-refresh)
  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Use networkOnly mode if specified in options
      const freshResources = await refreshResources(networkOnly);
      setResources(filterResources(freshResources));
      setLastRefreshTime(new Date());
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh resources'));
    } finally {
      setIsLoading(false);
    }
  }, [filterResources, networkOnly]);

  // Initial fetch
  useEffect(() => {
    if (initialFetch) {
      // Use the stale-while-revalidate pattern
      const fetchInitialData = async () => {
        setIsLoading(true);
        try {
          const data = await getAllResources();
          setResources(filterResources(data));
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to fetch resources'));
        } finally {
          setIsLoading(false);
        }
      };

      fetchInitialData();
    }
  }, [initialFetch, filterResources]);

  // Subscribe to resource changes
  useEffect(() => {
    const unsubscribe = subscribeToResourcesChanges((updatedResources) => {
      setResources(filterResources(updatedResources));
    });

    return unsubscribe;
  }, [filterResources]);

  return {
    resources,
    isLoading,
    error,
    refresh,
    isConnected,
    lastRefreshTime
  };
}

/**
 * Hook for accessing a single resource by ID
 *
 * @param id Resource ID
 * @returns Object containing the resource, loading state, and refresh function
 */
export function useResource(id: string) {
  const { resources, isLoading, error, refresh } = useResources();
  const resource = resources.find(r => r.id === id);

  return { resource, isLoading, error, refresh };
}