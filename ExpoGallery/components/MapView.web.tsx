import React, { forwardRef } from 'react';

// Add type declarations for the missing exports
declare module "@teovilla/react-native-web-maps" {
  const MapView: React.ComponentType<any>;
  export const Marker: React.ComponentType<any>;
  export const Callout: React.ComponentType<any>;
  export default MapView; // The warning on export default seems to work anyway
}

// Import after declaring the module
import MapView from "@teovilla/react-native-web-maps";
import { Marker, Callout } from "@teovilla/react-native-web-maps";

// Export the components and enhanced MapView
export { Marker, Callout };

const MapViewComponent = forwardRef((props: any, ref) => {
  return (
    <MapView
      {...props}
      ref={ref}
      provider="google"
      googleMapsApiKey='your-api-key-here'
    />
  );
});

export default MapViewComponent;
