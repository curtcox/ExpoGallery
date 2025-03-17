import { StyleSheet, ScrollView, View, Text, TouchableOpacity, Linking, Clipboard, Platform } from 'react-native';

interface AppLinkProps {
  name: string;
  urlScheme: string;
  description: string;
  parameters?: { name: string; description: string }[];
}

const AppLink = ({ name, urlScheme, description, parameters }: AppLinkProps) => {
  const handlePress = async () => {
    try {
      const supported = await Linking.canOpenURL(urlScheme);

      if (supported) {
        await Linking.openURL(urlScheme);
      } else {
        console.log(`Cannot open URL: ${urlScheme}`);
        // In a real app, you might want to show an alert here
      }
    } catch (error) {
      console.error(`Error opening URL: ${error}`);
    }
  };

  const copyToClipboard = () => {
    Clipboard.setString(urlScheme);
    // In a real app, you would show a toast or some feedback
    console.log('URL copied to clipboard');
  };

  return (
    <View style={styles.appLinkContainer}>
      <Text style={styles.appName}>{name}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.urlOuterContainer}>
        <Text style={styles.urlSectionTitle}>URL Scheme:</Text>
        <View style={styles.urlContainer}>
          <Text selectable={true} style={styles.urlText}>{urlScheme}</Text>
          <TouchableOpacity onPress={copyToClipboard} style={styles.copyButton}>
            <Text style={styles.copyButtonText}>Copy</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity onPress={handlePress} style={styles.launchButton}>
        <Text style={styles.link}>Launch {name}</Text>
      </TouchableOpacity>

      {parameters && parameters.length > 0 && (
        <View style={styles.parametersContainer}>
          <Text style={styles.parametersTitle}>Available Parameters:</Text>
          {parameters.map((param, index) => (
            <View key={index} style={styles.parameterItem}>
              <Text style={styles.parameterName}>{param.name}</Text>
              <Text style={styles.parameterDescription}>{param.description}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default function ExternalApps() {
  const appLinks: AppLinkProps[] = [
    {
      name: 'Safari',
      urlScheme: 'https://www.apple.com',
      description: 'Opens Safari with the specified URL',
      parameters: [
        { name: 'URL', description: 'Any valid URL to open in Safari' }
      ]
    },
    {
      name: 'Phone',
      urlScheme: 'tel:+11234567890',
      description: 'Opens the Phone app with a specific number',
      parameters: [
        { name: 'tel:', description: 'Followed by the phone number to call' }
      ]
    },
    {
      name: 'Messages',
      urlScheme: 'sms:+11234567890',
      description: 'Opens the Messages app to send an SMS',
      parameters: [
        { name: 'sms:', description: 'Followed by the phone number' },
        { name: 'body=', description: 'Optional message body text (URL encoded)' }
      ]
    },
    {
      name: 'Mail',
      urlScheme: 'mailto:example@example.com',
      description: 'Opens the Mail app to compose an email',
      parameters: [
        { name: 'mailto:', description: 'Followed by the email address' },
        { name: 'subject=', description: 'Email subject (URL encoded)' },
        { name: 'body=', description: 'Email body (URL encoded)' },
        { name: 'cc=', description: 'Carbon copy recipients (URL encoded, comma-separated)' },
        { name: 'bcc=', description: 'Blind carbon copy recipients (URL encoded, comma-separated)' }
      ]
    },
    {
      name: 'Maps',
      urlScheme: 'maps://?q=Apple+Park',
      description: 'Opens Apple Maps with a search query or coordinates',
      parameters: [
        { name: 'q=', description: 'Search query (URL encoded)' },
        { name: 'll=', description: 'Latitude,longitude coordinates' },
        { name: 'address=', description: 'Address to display (URL encoded)' },
        { name: 'daddr=', description: 'Destination address for directions (URL encoded)' },
        { name: 'saddr=', description: 'Starting address for directions (URL encoded)' }
      ]
    },
    {
      name: 'YouTube',
      urlScheme: 'youtube://www.youtube.com/watch?v=VIDEO_ID',
      description: 'Opens the YouTube app to a specific video',
      parameters: [
        { name: 'v=', description: 'YouTube video ID' },
        { name: 'list=', description: 'YouTube playlist ID' }
      ]
    },
    {
      name: 'Instagram',
      urlScheme: 'instagram://user?username=instagram',
      description: 'Opens the Instagram app to a specific profile or content',
      parameters: [
        { name: 'user?username=', description: 'Opens a specific user profile' },
        { name: 'media?id=', description: 'Opens a specific post using its ID' },
        { name: 'camera', description: 'Opens the Instagram camera' }
      ]
    },
    {
      name: 'Twitter/X',
      urlScheme: 'twitter://user?screen_name=twitter',
      description: 'Opens the Twitter/X app to a specific profile or tweet',
      parameters: [
        { name: 'user?screen_name=', description: 'Opens a user profile' },
        { name: 'status?id=', description: 'Opens a specific tweet by ID' },
        { name: 'post', description: 'Opens the tweet composer' },
        { name: 'search?query=', description: 'Performs a search (URL encoded)' }
      ]
    },
    {
      name: 'Facebook',
      urlScheme: 'fb://profile/PAGE_ID',
      description: 'Opens the Facebook app to a specific page or content',
      parameters: [
        { name: 'profile/PAGE_ID', description: 'Opens a specific page by ID' },
        { name: 'page/PAGE_ID', description: 'Opens a specific page by ID' },
        { name: 'group/GROUP_ID', description: 'Opens a specific group by ID' }
      ]
    },
    {
      name: 'WhatsApp',
      urlScheme: 'whatsapp://send?phone=NUMBER&text=MESSAGE',
      description: 'Opens WhatsApp to chat with a specific phone number',
      parameters: [
        { name: 'phone=', description: 'Phone number with country code, no "+" (e.g., 11234567890)' },
        { name: 'text=', description: 'Message text (URL encoded)' }
      ]
    },
    {
      name: 'Spotify',
      urlScheme: 'spotify:track:TRACK_ID',
      description: 'Opens the Spotify app to a specific track, album, or artist',
      parameters: [
        { name: 'track:', description: 'Followed by Spotify track ID' },
        { name: 'album:', description: 'Followed by Spotify album ID' },
        { name: 'artist:', description: 'Followed by Spotify artist ID' },
        { name: 'playlist:', description: 'Followed by Spotify playlist ID' },
        { name: 'search:', description: 'Performs a search query' }
      ]
    },
    {
      name: 'Google Maps',
      urlScheme: 'comgooglemaps://?q=Apple+Park',
      description: 'Opens Google Maps app with specific coordinates or search',
      parameters: [
        { name: 'q=', description: 'Search query or address (URL encoded)' },
        { name: 'center=', description: 'Latitude,longitude for map center' },
        { name: 'zoom=', description: 'Zoom level (1-21)' },
        { name: 'views=', description: 'Map view type (satellite, traffic, transit)' },
        { name: 'saddr=', description: 'Source address for directions (URL encoded)' },
        { name: 'daddr=', description: 'Destination address for directions (URL encoded)' },
        { name: 'directionsmode=', description: 'Mode of transportation (driving, walking, bicycling, transit)' }
      ]
    },
    {
      name: 'LinkedIn',
      urlScheme: 'linkedin://profile/PROFILE_ID',
      description: 'Opens the LinkedIn app to a specific profile',
      parameters: [
        { name: 'profile/PROFILE_ID', description: 'Opens a specific profile by ID' }
      ]
    },
    {
      name: 'Uber',
      urlScheme: 'uber://?action=setPickup&pickup=my_location',
      description: 'Opens the Uber app to request a ride',
      parameters: [
        { name: 'action=setPickup', description: 'Sets up a ride request' },
        { name: 'pickup=my_location', description: 'Uses current location as pickup point' },
        { name: 'pickup[latitude]=', description: 'Specific latitude for pickup' },
        { name: 'pickup[longitude]=', description: 'Specific longitude for pickup' },
        { name: 'pickup[nickname]=', description: 'Name for pickup location (URL encoded)' },
        { name: 'pickup[formatted_address]=', description: 'Address for pickup (URL encoded)' },
        { name: 'dropoff[latitude]=', description: 'Specific latitude for dropoff' },
        { name: 'dropoff[longitude]=', description: 'Specific longitude for dropoff' },
        { name: 'dropoff[nickname]=', description: 'Name for dropoff location (URL encoded)' },
        { name: 'dropoff[formatted_address]=', description: 'Address for dropoff (URL encoded)' },
        { name: 'product_id=', description: 'Specific Uber product/service ID' }
      ]
    },
    {
      name: 'Lyft',
      urlScheme: 'lyft://ridetype?id=lyft&pickup[latitude]=37.7833&pickup[longitude]=-122.4167',
      description: 'Opens the Lyft app to request a ride',
      parameters: [
        { name: 'id=', description: 'Lyft ride type (lyft, lyft_line, lyft_plus)' },
        { name: 'pickup[latitude]=', description: 'Latitude for pickup location' },
        { name: 'pickup[longitude]=', description: 'Longitude for pickup location' },
        { name: 'destination[latitude]=', description: 'Latitude for destination' },
        { name: 'destination[longitude]=', description: 'Longitude for destination' }
      ]
    }
  ];

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>iOS App URL Schemes</Text>
      <Text style={styles.subheader}>
        iOS apps can be launched from other apps using special URL schemes. These URLs allow you
        to deep-link directly into specific app features or pass data between apps. Below are various
        common iOS app URL schemes - you can copy them, modify the parameters, and use them in your own app.
      </Text>

      {appLinks.map((app, index) => (
        <AppLink key={index} {...app} />
      ))}

      <View style={styles.notes}>
        <Text style={styles.notesHeader}>Important Notes:</Text>
        <Text style={styles.noteText}>
          • Not all apps may be installed on the user's device
        </Text>
        <Text style={styles.noteText}>
          • Some URL schemes may change with app updates
        </Text>
        <Text style={styles.noteText}>
          • Custom URL schemes require the app to be installed
        </Text>
        <Text style={styles.noteText}>
          • Some apps may require specific permission settings
        </Text>
        <Text style={styles.noteText}>
          • URL parameters should be properly URL-encoded in production code
        </Text>
      </View>

      <View style={styles.exampleSection}>
        <Text style={styles.exampleTitle}>How to Use in Your App:</Text>
        <Text style={styles.exampleCode}>
          {`// Check if the app is installed first\nconst canOpen = await Linking.canOpenURL(urlScheme);\n\n// Then open the URL if supported\nif (canOpen) {\n  await Linking.openURL(urlScheme);\n}`}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  subheader: {
    fontSize: 16,
    marginBottom: 24,
    color: '#666',
    lineHeight: 22,
  },
  appLinkContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  description: {
    fontSize: 14,
    marginBottom: 12,
    color: '#666',
    lineHeight: 20,
  },
  urlOuterContainer: {
    marginBottom: 12,
  },
  urlSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  urlContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e6f0ff',
    flexWrap: 'wrap',
  },
  urlText: {
    fontSize: 14,
    color: '#0066cc',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    flex: 1,
    flexWrap: 'wrap',
  },
  urlLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#444',
    marginRight: 8,
  },
  copyButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginLeft: 8,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  launchButton: {
    marginBottom: 16,
  },
  link: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 16,
    fontWeight: '500',
  },
  parametersContainer: {
    backgroundColor: '#f5f5f7',
    padding: 12,
    borderRadius: 8,
  },
  parametersTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  parameterItem: {
    marginBottom: 10,
  },
  parameterName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  parameterDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  notes: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
  },
  notesHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  exampleSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  exampleCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 20,
    color: '#333',
    backgroundColor: '#f5f5f7',
    padding: 12,
    borderRadius: 6,
  },
});