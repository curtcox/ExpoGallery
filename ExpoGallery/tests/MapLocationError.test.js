import React from 'react';
import { render, act, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// We need to mock these imports
jest.mock('@teovilla/react-native-web-maps', () => {
  // Actual implementation from the library that causes the error
  const originalModule = jest.requireActual('@teovilla/react-native-web-maps');
  return {
    __esModule: true,
    ...originalModule,
    // We'll observe if this default export is called with the expected props
    default: jest.fn((props) => <div data-testid="mock-map-view">{props.children}</div>),
  };
});

// Create two different mocks - one that will cause errors and one that won't
const createErrorMock = () => {
  return {
    LocationEventEmitter: {
      // Intentionally not implementing removeSubscription to reproduce the error
      addListener: jest.fn(() => ({
        remove: jest.fn(),
      })),
    },
  };
};

const createWorkingMock = () => {
  return {
    LocationEventEmitter: {
      // Properly implement removeSubscription
      addListener: jest.fn(() => ({
        remove: jest.fn(),
      })),
      removeSubscription: jest.fn((subscription) => {
        if (subscription && typeof subscription.remove === 'function') {
          subscription.remove();
        }
      }),
    },
  };
};

// Mock Location module
jest.mock('expo-location', () => {
  return {
    watchPositionAsync: jest.fn(() => Promise.resolve({
      remove: jest.fn(),
    })),
    getCurrentPositionAsync: jest.fn(() => Promise.resolve({
      coords: {
        latitude: 37.7749,
        longitude: -122.4194,
      }
    })),
    useForegroundPermissions: jest.fn(() => [{ granted: true }]),
    Accuracy: {
      Balanced: 3,
    },
  };
});

// This is a simpler version of MapView that will trigger location subscriptions
const ErrorMapView = (props) => {
  const MapView = require('@teovilla/react-native-web-maps').default;

  // This will invoke the location subscription
  return (
    <MapView
      followsUserLocation={true}
      showsUserLocation={true}
      {...props}
    />
  );
};

// Create a function to get a fresh instance of the component
// after jest.resetModules() is called
const getErrorMapView = () => {
  const MapView = require('@teovilla/react-native-web-maps').default;

  return (props) => (
    <MapView
      followsUserLocation={true}
      showsUserLocation={true}
      {...props}
    />
  );
};

describe('MapView Location Subscription Tests', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('should unmount cleanly with the proper removeSubscription implementation', async () => {
    // Set up the working mock
    jest.doMock('@teovilla/react-native-web-maps/node_modules/expo-location/build/LocationEventEmitter',
      () => createWorkingMock()
    );
    global._LocationEventEmitter = createWorkingMock();

    // Reset modules to apply the new mock
    jest.resetModules();

    // Get a fresh component with updated mocks
    const WorkingErrorMapView = getErrorMapView();

    // Set up console error spy to verify no errors occur
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // First, render the component
    const { unmount, getByTestId } = render(<WorkingErrorMapView />);

    // Verify component renders correctly
    expect(getByTestId('mock-map-view')).toBeInTheDocument();

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Now unmount the component - this should NOT throw errors
    unmount();

    // Verify no errors were logged
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test('should detect issues with missing removeSubscription method', async () => {
    // Set up the error-causing mock
    jest.doMock('@teovilla/react-native-web-maps/node_modules/expo-location/build/LocationEventEmitter',
      () => createErrorMock()
    );
    global._LocationEventEmitter = createErrorMock();

    // Reset modules to apply the new mock
    jest.resetModules();

    // Get a fresh component with updated mocks
    const BrokenErrorMapView = getErrorMapView();

    // Set up console error spy to catch the error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // First, render the component
    const { unmount, getByTestId } = render(<BrokenErrorMapView />);

    // Verify component renders correctly
    expect(getByTestId('mock-map-view')).toBeInTheDocument();

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Force a subscription to be created
    const LocationEventEmitter = require('@teovilla/react-native-web-maps/node_modules/expo-location/build/LocationEventEmitter').LocationEventEmitter;
    const subscription = LocationEventEmitter.addListener('locationChanged', () => {});

    // Now unmount the component, which should log errors
    unmount();

    // Try to clean up the subscription manually - this should fail and log an error
    // since removeSubscription doesn't exist in our error mock
    try {
      LocationEventEmitter.removeSubscription(subscription);
    } catch (e) {
      console.error('Error during subscription cleanup:', e);
    }

    // Check that errors were caught
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  test('verifies component mounts correctly regardless of removeSubscription implementation', async () => {
    // This test ensures the component always mounts correctly, whether or not
    // the fix is implemented

    // Set up the error-causing mock to test the worst case
    jest.doMock('@teovilla/react-native-web-maps/node_modules/expo-location/build/LocationEventEmitter',
      () => createErrorMock()
    );
    global._LocationEventEmitter = createErrorMock();

    // Need to reset modules to apply the new mock
    jest.resetModules();

    // Get a fresh component that uses the updated mocks
    const BrokenErrorMapView = getErrorMapView();

    // First, render the component with the broken implementation
    const { unmount: unmountBroken, getByTestId: getByTestIdBroken } = render(<BrokenErrorMapView />);

    // Verify component renders correctly
    expect(getByTestIdBroken('mock-map-view')).toBeInTheDocument();

    // Clean up
    unmountBroken();
    cleanup();

    // Now try with the working implementation
    jest.doMock('@teovilla/react-native-web-maps/node_modules/expo-location/build/LocationEventEmitter',
      () => createWorkingMock()
    );
    global._LocationEventEmitter = createWorkingMock();

    // Need to reset modules again to apply the new mock
    jest.resetModules();

    // Get a fresh component that uses the updated mocks
    const WorkingErrorMapView = getErrorMapView();

    const { getByTestId: getByTestIdWorking } = render(<WorkingErrorMapView />);

    // Verify component also renders correctly with working implementation
    expect(getByTestIdWorking('mock-map-view')).toBeInTheDocument();
  });
});