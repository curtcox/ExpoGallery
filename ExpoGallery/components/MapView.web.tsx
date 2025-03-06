import React, { forwardRef, useEffect } from 'react';
import { info, error } from '@/utils/index';
import { GOOGLE_MAPS_API_KEY } from '../constants/Env';

// Import the map components
// @ts-ignore - Ignoring type issues with this web package
import MapView from "@teovilla/react-native-web-maps";
// @ts-ignore - Ignoring type issues with this web package
import { Marker, Callout } from "@teovilla/react-native-web-maps";

// Define types for the global scope
declare global {
  interface Window {
    _LocationEventEmitter?: {
      LocationEventEmitter?: {
        removeSubscription?: (subscription: any) => void;
      };
    };
  }
}

// Apply a monkey patch to fix the missing removeSubscription method
// This needs to be executed before any components are rendered
(function applyMonkeyPatch() {
  try {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      // Create a safe global object for the event emitter if it doesn't exist
      if (!window._LocationEventEmitter) {
        window._LocationEventEmitter = {};
      }

      if (!window._LocationEventEmitter.LocationEventEmitter) {
        window._LocationEventEmitter.LocationEventEmitter = {};
      }

      // Add the missing removeSubscription method
      if (!window._LocationEventEmitter.LocationEventEmitter.removeSubscription) {
        window._LocationEventEmitter.LocationEventEmitter.removeSubscription = function(subscription: any) {
          // Log the patch being applied (helpful for debugging)
          console.log('Applying patch for removeSubscription');

          // Safe implementation that won't throw errors
          if (subscription && typeof subscription.remove === 'function') {
            subscription.remove();
          }
        };
      }

      // Also check global scope for Node.js-like environments
      if (typeof global !== 'undefined') {
        // @ts-ignore - global might not be defined in TypeScript
        if (!global._LocationEventEmitter) {
          // @ts-ignore
          global._LocationEventEmitter = {};
        }

        // @ts-ignore
        if (!global._LocationEventEmitter.LocationEventEmitter) {
          // @ts-ignore
          global._LocationEventEmitter.LocationEventEmitter = {};
        }

        // @ts-ignore
        if (!global._LocationEventEmitter.LocationEventEmitter.removeSubscription) {
          // @ts-ignore
          global._LocationEventEmitter.LocationEventEmitter.removeSubscription = function(subscription: any) {
            // Safe implementation that won't throw errors
            if (subscription && typeof subscription.remove === 'function') {
              subscription.remove();
            }
          };
        }
      }
    }
  } catch (e) {
    console.error('Failed to apply monkey patch for LocationEventEmitter', e);
  }
})();

// Export the components and enhanced MapView
export { Marker, Callout };

// Create a MapView wrapper that injects the API key
const MapViewComponent = forwardRef((props: any, ref: any) => {
  // Debug log for the API key (will show in browser console)
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      error('No API key found',null);
    } else {
      info('MapView API key is set (**********' + GOOGLE_MAPS_API_KEY.slice(-4) + ')');
    }
  }, []);

  return (
    // @ts-ignore - Ignore TypeScript errors for the web component
    <MapView
      {...props}
      ref={ref}
      provider="google"
      googleMapsApiKey={GOOGLE_MAPS_API_KEY}
    />
  );
});

export default MapViewComponent;
