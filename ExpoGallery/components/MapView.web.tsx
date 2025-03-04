import React, { forwardRef, useEffect } from 'react';
import { info, error } from '@/utils/index';
import { GOOGLE_MAPS_API_KEY } from '../constants/Env';

// Import the map components
// @ts-ignore - Ignoring type issues with this web package
import MapView from "@teovilla/react-native-web-maps";
// @ts-ignore - Ignoring type issues with this web package
import { Marker, Callout } from "@teovilla/react-native-web-maps";

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
