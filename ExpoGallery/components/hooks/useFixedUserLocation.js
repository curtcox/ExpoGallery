import * as Location from 'expo-location';
import { useCallback, useEffect, useState, useRef } from 'react';

// Apply monkey patch for location event emitter if needed
(function applyLocationPatch() {
  try {
    // Check if running in a browser environment
    if (typeof window !== 'undefined') {
      // Fix for the LocationEventEmitter missing removeSubscription method
      if (window._LocationEventEmitter &&
          window._LocationEventEmitter.LocationEventEmitter) {
        window._LocationEventEmitter.LocationEventEmitter.removeSubscription =
          window._LocationEventEmitter.LocationEventEmitter.removeSubscription ||
          function(subscription) {
            if (subscription && typeof subscription.remove === 'function') {
              subscription.remove();
            }
          };
      }
    }
  } catch (e) {
    console.error('Failed to apply location patch', e);
  }
})();

/**
 * This is a fixed version of the useUserLocation hook from @teovilla/react-native-web-maps
 * that correctly handles cleanup of location subscriptions.
 */
export function useFixedUserLocation(options = {}) {
  const [location, setLocation] = useState();
  const watchPositionSubscriptionRef = useRef(null);

  // Get location permissions
  const [permission] = Location.useForegroundPermissions({
    request: options.requestPermission,
    get: options.showUserLocation
  });

  // Handle location changes
  const handleLocationChange = useCallback(function (e) {
    if (!e || !e.coords) {
      console.warn('Received invalid location data', e);
      return;
    }

    setLocation(e);

    // Call the onUserLocationChange callback if provided
    if (options.onUserLocationChange) {
      try {
        options.onUserLocationChange({
          nativeEvent: {
            coordinate: {
              ...e.coords,
              timestamp: Date.now(),
              altitude: e.coords.altitude || 0,
              heading: e.coords.heading || 0,
              accuracy: e.coords.accuracy || Location.Accuracy.Balanced,
              isFromMockProvider: e.mocked || false,
              speed: e.coords.speed || 0
            }
          }
        });
      } catch (error) {
        console.error('Error in onUserLocationChange callback', error);
      }
    }
  }, [options.onUserLocationChange]);

  // Set up location watching and cleanup
  useEffect(() => {
    let isMounted = true;
    let watchSubscription = null;

    const setupLocationWatching = async () => {
      try {
        if (permission?.granted && options.followUserLocation) {
          // Get initial position
          const initialLocation = await Location.getCurrentPositionAsync();
          if (isMounted) {
            handleLocationChange(initialLocation);
          }

          // Watch position
          const subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced
            },
            (locationUpdate) => {
              if (isMounted) {
                handleLocationChange(locationUpdate);
              }
            }
          );

          if (isMounted) {
            watchSubscription = subscription;
            watchPositionSubscriptionRef.current = subscription;
          } else {
            // If component unmounted during async operation, clean up
            try {
              // Direct cleanup without using removeSubscription
              subscription.remove();
            } catch (e) {
              console.error('Error removing subscription', e);
            }
          }
        }
      } catch (error) {
        console.error('Error setting up location services:', error);
      }
    };

    setupLocationWatching();

    // Cleanup function - directly removes the subscription
    return () => {
      isMounted = false;

      try {
        // Try both the ref and local variable for maximum safety
        if (watchPositionSubscriptionRef.current) {
          try {
            // Direct cleanup without using removeSubscription
            if (typeof watchPositionSubscriptionRef.current.remove === 'function') {
              console.log('Cleaning up location subscription (from ref)');
              watchPositionSubscriptionRef.current.remove();
            }
          } catch (e) {
            console.error('Error removing ref subscription', e);
          }
        }

        if (watchSubscription) {
          try {
            // Direct cleanup without using removeSubscription
            if (typeof watchSubscription.remove === 'function') {
              console.log('Cleaning up location subscription (from local)');
              watchSubscription.remove();
            }
          } catch (e) {
            console.error('Error removing local subscription', e);
          }
        }
      } catch (error) {
        console.error('Error cleaning up location subscription:', error);
      }
    };
  }, [permission, options.followUserLocation, handleLocationChange]);

  return location;
}