/**
 * This file provides fixed versions of the map components that work correctly on web
 */
import { Platform } from 'react-native';

// Import from the web-patched version
import FixedMapView from './FixedMapView';
import { Marker, Callout } from './MapView';

// Export the fixed components for use in the app
export { Marker, Callout };
export default FixedMapView;