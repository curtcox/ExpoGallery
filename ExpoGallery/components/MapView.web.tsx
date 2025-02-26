import MapView from "@teovilla/react-native-web-maps";
import Constants from 'expo-constants';

// Create custom Marker and Callout components for web
// since they're not exported by the web maps package
const Marker = ({ coordinate, title, description, children }: any) => (
  <div
    style={{
      position: 'absolute',
      transform: 'translate(-50%, -100%)',
      left: coordinate?.latitude,
      top: coordinate?.longitude,
    }}
  >
    {children}
  </div>
);

const Callout = ({ children }: any) => (
  <div style={{ padding: 10, backgroundColor: 'white', borderRadius: 5 }}>
    {children}
  </div>
);

// Export the components and enhanced MapView
export { Marker, Callout };
export default (props: any) => (
  <MapView
    {...props}
    provider="google"
    googleMapsApiKey='your key here'
  />
);
