export type ExampleItem = {
  name: string;
  text: string;
  icon: string;
  url: string;
  selected?: boolean;
};

export const ALL_EXAMPLES: ExampleItem[] = [
  { name: 'sensors',            text: 'Sensors',                icon: 'pulse-outline',          url: 'versions/latest/sdk/sensors/' },
  { name: 'auth-session',       text: 'Auth Session',           icon: 'auth-session',          url: 'versions/latest/sdk/auth-session/' },
  { name: 'accelerometer',      text: 'Accelerometer',          icon: 'pulse-outline',          url: 'versions/latest/sdk/accelerometer/' },
  { name: 'barometer',          text: 'Barometer',              icon: 'pulse-outline',          url: 'versions/latest/sdk/barometer/' },
  { name: 'battery',            text: 'Battery',                icon: 'battery',                url: 'versions/latest/sdk/battery/' },
  { name: 'clipboard',          text: 'Clipboard',              icon: 'clipboard',              url: 'versions/latest/sdk/clipboard/' },
  { name: 'cellular',           text: 'Cellular',               icon: 'cellular',               url: 'versions/latest/sdk/cellular/' },
  { name: 'device-motion',      text: 'Device Motion',          icon: 'pulse-outline',          url: 'versions/latest/sdk/devicemotion/' },
  { name: 'gyroscope',          text: 'Gyroscope',              icon: 'pulse-outline',          url: 'versions/latest/sdk/gyroscope/' },
  { name: 'magnetometer',       text: 'Magnetometer',           icon: 'pulse-outline',          url: 'versions/latest/sdk/magnetometer/' },
  { name: 'pedometer',          text: 'Pedometer',              icon: 'pulse-outline',          url: 'versions/latest/sdk/pedometer/' },
  { name: 'light-sensor',       text: 'Light Sensor',           icon: 'pulse-outline',          url: 'versions/latest/sdk/light-sensor/' },
  { name: 'alert',              text: 'Alert',                  icon: 'alert-outline',          url: 'https://reactnative.dev/docs/alert' },
  { name: 'asset',              text: 'Asset',                  icon: 'alert-outline',          url: 'versions/latest/sdk/asset/' },
  { name: 'notifications',      text: 'Notifications',          icon: 'notifications-outline',  url: 'versions/latest/sdk/notifications/' },
  { name: 'list',               text: 'List',                   icon: 'list-outline',           url: 'versions/latest/sdk/flash-list/' },
  { name: 'location',           text: 'Location',               icon: 'locate-outline',         url: 'versions/latest/sdk/location/' },
  { name: 'network',            text: 'Network',                icon: 'wifi-outline',           url: 'https://github.com/react-native-netinfo/react-native-netinfo' },
  { name: 'location-indicator', text: 'Location Indicator',     icon: 'locate-outline',         url: 'versions/latest/sdk/location/' },
  { name: 'status-bar',         text: 'Status Bar',             icon: 'locate-outline',         url: 'versions/latest/sdk/status-bar/' },
  { name: 'image',              text: 'Image',                  icon: 'image-outline',          url: 'versions/latest/sdk/flash-list/' },
  { name: 'image-from-storage', text: 'Image from Storage',     icon: 'image-outline',          url: 'versions/latest/sdk/filesystem/' },
  { name: 'gradient',           text: 'Gradient',               icon: 'image-outline',          url: 'versions/latest/sdk/linear-gradient/' },
  { name: 'storage',            text: 'Storage',                icon: 'folder-outline',         url: 'versions/latest/sdk/async-storage/' },
  { name: 'device-id',          text: 'Device ID',              icon: 'pricetag',               url: 'https://stackoverflow.com/questions/46863644/expo-get-unique-device-id-without-ejecting' },
  { name: 'device-info',        text: 'Device Info',            icon: 'information',            url: 'versions/latest/sdk/device/' },
  { name: 'chatty',             text: 'Chatty',                 icon: 'chatbubble-outline',     url: 'https://github.com/MuhammedKpln/react-native-chatty' },
  { name: 'gifted-chat',        text: 'Gifted Chat',            icon: 'chatbubble-outline',     url: 'https://github.com/FaridSafi/react-native-gifted-chat' },
  { name: 'keyboard-avoiding',  text: 'Keyboard Avoiding View', icon: 'keypad-outline',         url: 'https://docs.expo.dev/guides/keyboard-handling/' },
  { name: 'chat-links',         text: 'Chat with links',        icon: 'chatbubble-outline',     url: 'https://github.com/FaridSafi/react-native-gifted-chat' },
  { name: 'crypto',             text: 'Crypto',                 icon: 'key',                    url: 'latest/sdk/crypto/' },
  { name: 'icons',              text: 'Icons',                  icon: 'images-sharp',           url: 'guides/icons/' },
  { name: 'map',                text: 'Map',                    icon: 'map-outline',            url: 'versions/latest/sdk/map-view/' },
  { name: 'map-pins',           text: 'Map Pins',               icon: 'pin-outline',            url: 'map-pins-example' },
  { name: 'fetch',              text: 'Fetch',                  icon: 'cloud-download-outline', url: 'versions/latest/sdk/expo/#api' },
  { name: 'local-storage',      text: 'Local Storage',          icon: 'folder-outline',         url: 'versions/latest/sdk/filesystem/' },
  { name: 'secure-storage',     text: 'Secure Storage',         icon: 'lock-closed',            url: 'versions/latest/sdk/securestore/' },
  { name: 'svg',                text: 'SVG',                    icon: 'SVG',                    url: 'versions/latest/sdk/svg/' },
  { name: 'json',               text: 'JSON',                   icon: 'code-outline',           url: 'json-example' },
  { name: 'external-app',       text: 'External App',           icon: 'open-outline',           url: 'linking/into-other-apps/' },
  { name: 'query-param',        text: 'Query Param',            icon: 'open-outline',           url: 'router/reference/url-parameters/' },
  { name: 'text-to-speech',     text: 'Text to Speech',         icon: 'volume-high-outline',    url: 'versions/latest/sdk/speech/' },
  { name: 'speech-to-text',     text: 'Speech to Text',         icon: 'mic-outline',            url: 'https://github.com/trestrantham/react-native-speech-recognition' },
  { name: 'webbrowser',         text: 'Web browser',            icon: 'webbrowser',             url: 'versions/latest/sdk/webbrowser/' },
];