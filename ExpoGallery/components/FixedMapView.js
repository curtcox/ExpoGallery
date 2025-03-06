import React, { forwardRef, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import MapView from '@/components/MapView';
import { Marker, Callout } from '@/components/MapView';
import { useFixedUserLocation } from '@/components/hooks/useFixedUserLocation';

/**
 * This is a fixed version of the MapView from @teovilla/react-native-web-maps
 * that correctly handles location subscriptions on the web.
 * @type {React.ForwardRefExoticComponent<React.PropsWithChildren<any> & React.RefAttributes<any>>}
 */
const FixedMapView = forwardRef((props, ref) => {
  const [userLocation, setUserLocation] = useState(null);

  // Only apply the fix for web platform
  if (Platform.OS === 'web') {
    // Extract the location-related props but keep all others
    const {
      followsUserLocation,
      showsUserLocation,
      onUserLocationChange,
      ...otherProps
    } = props;

    // Use our fixed location hook if user location features are enabled
    const location = useFixedUserLocation({
      followUserLocation: followsUserLocation,
      showUserLocation: showsUserLocation,
      onUserLocationChange: onUserLocationChange,
    });

    // Update the user location state when location changes
    useEffect(() => {
      if (location) {
        setUserLocation(location);
      }
    }, [location]);

    // Return the map view with our fixed user location handling
    // but still pass all other props through
    return (
      <MapView
        {...otherProps}
        showsUserLocation={showsUserLocation}
        followsUserLocation={followsUserLocation}
        ref={ref}
      />
    );
  }

  // For native platforms, use the original MapView component
  return <MapView {...props} ref={ref} />;
});

export { Marker, Callout };
export default FixedMapView;