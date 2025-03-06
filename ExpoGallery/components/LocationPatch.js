/**
 * This file provides a runtime patch for the LocationEventEmitter
 * issue in @teovilla/react-native-web-maps.
 *
 * Import this file at the very beginning of your app to apply the patch.
 */

// Apply the patch immediately when this file is imported
(function applyLocationEventEmitterPatch() {
  try {
    // We need to require the exact module that's being used internally
    // This is the actual path in the error stack trace
    const locationPath = '@teovilla/react-native-web-maps/node_modules/expo-location/build/LocationEventEmitter';

    // Try to load the module directly
    try {
      const LocationEventEmitterModule = require(locationPath);

      // If we successfully loaded it, patch it directly
      if (LocationEventEmitterModule &&
          LocationEventEmitterModule.LocationEventEmitter &&
          !LocationEventEmitterModule.LocationEventEmitter.removeSubscription) {

        console.log('Applying direct patch to LocationEventEmitter.removeSubscription');

        // Add the missing method
        LocationEventEmitterModule.LocationEventEmitter.removeSubscription = function(subscription) {
          // Just call remove() directly on the subscription
          if (subscription && typeof subscription.remove === 'function') {
            subscription.remove();
          }
        };
      }
    } catch (moduleError) {
      console.warn('Could not load LocationEventEmitter module directly:', moduleError);
    }

    // Fallback: patch the global object
    if (typeof global !== 'undefined') {
      if (!global._LocationEventEmitter) {
        global._LocationEventEmitter = {};
      }

      if (!global._LocationEventEmitter.LocationEventEmitter) {
        global._LocationEventEmitter.LocationEventEmitter = {};
      }

      if (!global._LocationEventEmitter.LocationEventEmitter.removeSubscription) {
        global._LocationEventEmitter.LocationEventEmitter.removeSubscription = function(subscription) {
          if (subscription && typeof subscription.remove === 'function') {
            subscription.remove();
          }
        };
      }
    }

    // Also patch window for browser environments
    if (typeof window !== 'undefined') {
      if (!window._LocationEventEmitter) {
        window._LocationEventEmitter = {};
      }

      if (!window._LocationEventEmitter.LocationEventEmitter) {
        window._LocationEventEmitter.LocationEventEmitter = {};
      }

      if (!window._LocationEventEmitter.LocationEventEmitter.removeSubscription) {
        window._LocationEventEmitter.LocationEventEmitter.removeSubscription = function(subscription) {
          if (subscription && typeof subscription.remove === 'function') {
            subscription.remove();
          }
        };
      }
    }

    // Try to directly patch the expo-location Subscriber class
    try {
      const LocationSubscribers = require('@teovilla/react-native-web-maps/node_modules/expo-location/build/LocationSubscribers');

      // Find the Subscriber class unregisterCallback method and monkey patch it
      if (LocationSubscribers) {
        // The method is on a Subscriber class instance
        const originalSubscriberPrototype = Object.getPrototypeOf(LocationSubscribers.LocationSubscriber);

        if (originalSubscriberPrototype && originalSubscriberPrototype.unregisterCallback) {
          const originalUnregisterCallback = originalSubscriberPrototype.unregisterCallback;

          // Override the method with our safer version
          originalSubscriberPrototype.unregisterCallback = function(id) {
            try {
              // Try the original implementation first
              return originalUnregisterCallback.call(this, id);
            } catch (error) {
              // If it fails due to missing removeSubscription, handle it ourselves
              if (error && error.message && error.message.includes('removeSubscription is not a function')) {
                console.log('Applying fallback for removeSubscription in unregisterCallback');

                // Do nothing if already unregistered
                if (!this.callbacks[id]) {
                  return;
                }

                // Delete the callback
                delete this.callbacks[id];

                // Try to remove the watch
                try {
                  if (typeof ExpoLocation !== 'undefined' && ExpoLocation.removeWatchAsync) {
                    ExpoLocation.removeWatchAsync(id);
                  }
                } catch (e) {
                  console.warn('Could not remove watch:', e);
                }

                // Clean up the subscription directly if needed
                if (Object.keys(this.callbacks).length === 0 && this.eventSubscription) {
                  if (typeof this.eventSubscription.remove === 'function') {
                    this.eventSubscription.remove();
                  }
                  this.eventSubscription = null;
                }
              } else {
                // Rethrow other errors
                throw error;
              }
            }
          };
        }
      }
    } catch (subscriberError) {
      console.warn('Could not patch LocationSubscribers directly:', subscriberError);
    }

    console.log('LocationEventEmitter patch applied');
  } catch (e) {
    console.error('Failed to apply LocationEventEmitter patch:', e);
  }
})();

export default function isLocationPatchApplied() {
  // Function to check if the patch is applied
  try {
    if (typeof global !== 'undefined' &&
        global._LocationEventEmitter &&
        global._LocationEventEmitter.LocationEventEmitter &&
        typeof global._LocationEventEmitter.LocationEventEmitter.removeSubscription === 'function') {
      return true;
    }

    if (typeof window !== 'undefined' &&
        window._LocationEventEmitter &&
        window._LocationEventEmitter.LocationEventEmitter &&
        typeof window._LocationEventEmitter.LocationEventEmitter.removeSubscription === 'function') {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
}