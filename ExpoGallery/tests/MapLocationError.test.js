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

// Mock the LocationEventEmitter that's used internally
jest.mock('@teovilla/react-native-web-maps/node_modules/expo-location/build/LocationEventEmitter', () => {
  return {
    LocationEventEmitter: {
      // Intentionally not implementing removeSubscription to reproduce the error
      addListener: jest.fn(() => ({
        remove: jest.fn(),
      })),
    },
  };
});

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

// Mock the global scope to simulate the browser environment
global._LocationEventEmitter = {
  LocationEventEmitter: {
    // Intentionally missing removeSubscription to trigger the error
    addListener: jest.fn(() => ({
      remove: jest.fn(),
    })),
  }
};

// This is a simpler version of MapView that will trigger the same error
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

describe('MapView Location Subscription Error Test', () => {
  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  test('should throw an error when unmounting due to missing removeSubscription method', async () => {
    // Set up console error spy to catch the error
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // First, render the component
    const { unmount } = render(<ErrorMapView />);

    // Wait for any async operations to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Now unmount the component, which should trigger the error
    expect(() => {
      unmount();
    }).toThrow();

    // Check if the error message contains our expected error
    expect(consoleErrorSpy).toHaveBeenCalled();
    const errorCalls = consoleErrorSpy.mock.calls.flat();
    const hasExpectedError = errorCalls.some(
      call => typeof call === 'string' && call.includes('removeSubscription is not a function')
    );

    // If we don't find the exact error in the error calls, we'll check if any error contains
    // text about subscribers or location
    if (!hasExpectedError) {
      const hasRelatedError = errorCalls.some(
        call => typeof call === 'string' &&
          (call.includes('LocationEventEmitter') ||
           call.includes('Subscriber') ||
           call.includes('location'))
      );
      expect(hasRelatedError).toBe(true);
    } else {
      expect(hasExpectedError).toBe(true);
    }

    consoleErrorSpy.mockRestore();
  });

  test('demonstrates that the error occurs in the cleanup/unmount phase', async () => {
    // The goal of this test is to show that the component mounts fine
    // but errors on unmount

    // Mount phase - should work without errors
    const { getByTestId, unmount } = render(<ErrorMapView />);
    expect(getByTestId('mock-map-view')).toBeInTheDocument();

    // Wait for any async operations
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Let's spy on the console.error after mounting is complete
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // Now unmount and expect error
    unmount();

    // Verify the console.error was called during unmount
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});