import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface WebViewProps {
  source?: { uri: string };
  style?: ViewStyle;
  [key: string]: any;
}

// For web, we can use a standard iframe as the WebView component
export const WebView: React.FC<WebViewProps> = ({ source, style, ...props }) => {
  const uri = source?.uri || '';

  return (
    <View style={[styles.container, style]}>
      <iframe
        src={uri}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
        }}
        title="Web Content"
        allowFullScreen
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
