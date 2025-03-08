import React, { useState, useEffect } from 'react';
import { ScrollView, View, TextInput, Button, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { save, getValueFor, getAllKeys } from '../utils/index';
import { error } from '@/utils/logger';

export default function Example() {
  const [url, setUrl] = useState('');
  const [savedUrls, setSavedUrls] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<any>(null);
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [lastOperation, setLastOperation] = useState<{ key: string, value: string, type: string }>({ key: '', value: '', type: '' });
  const [errorInfo, setErrorInfo] = useState<{
    error: any,
    context: string
  } | null>(null);

  // Storage key prefixes
  const METADATA_PREFIX = 'url_metadata_';
  const CONTENT_PREFIX = 'url_content_';

  // Initialize storage
  useEffect(() => {
    const setupStorage = async () => {
      try {
        // Convert keys to non-readonly before setting state
        await getAllKeys((keys: readonly string[]) => {
          setSavedUrls([...keys]);
        });
      } catch (e: any) {
        error('Error setting up storage:', e);
        setErrorInfo({
          error: e,
          context: 'Error initializing storage'
        });
      }
    };

    setupStorage();
  }, []);

  // Clear error state
  const clearError = () => {
    setErrorInfo(null);
  };

  // Load the list of saved URLs
  const loadSavedUrls = async () => {
    try {
      // Clear any previous errors
      clearError();

      await getAllKeys((keys: readonly string[]) => {
        // Filter keys that start with the metadata prefix and extract the URL ID
        const urls = keys
          .filter((key: string) => key.startsWith(METADATA_PREFIX))
          .map((key: string) => key.replace(METADATA_PREFIX, ''));

        setSavedUrls(urls);
      });
    } catch (e: any) {
      error('Error loading saved URLs:', e);
      setErrorInfo({
        error: e,
        context: 'Error loading saved URLs'
      });
    }
  };

  // Fetch URL content and save to storage
  const fetchUrl = async () => {
    if (!url.trim()) return;

    setLoading(true);
    // Clear any previous errors
    clearError();

    try {
      // Sanitize URL for storage key (remove protocol and special chars)
      const sanitizedUrl = url.replace(/(^\w+:|^)\/\//, '').replace(/[^a-zA-Z0-9]/g, '_');

      // Fetch the URL
      const response = await fetch(url);

      // Check for HTTP error status
      if (!response.ok) {
        throw {
          status: response.status,
          statusText: response.statusText,
          message: `HTTP error ${response.status}: ${response.statusText}`,
          headers: Object.fromEntries(response.headers.entries()),
          url: url
        };
      }

      const responseText = await response.text();

      // Create metadata
      const meta = {
        originalUrl: url,
        fetchedAt: new Date().toISOString(),
        contentType: response.headers.get('content-type'),
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      };

      // Save content and metadata using the storage utility
      await save(CONTENT_PREFIX + sanitizedUrl, responseText, setLastOperation);
      await save(METADATA_PREFIX + sanitizedUrl, JSON.stringify(meta), setLastOperation);

      // Refresh list of saved URLs
      loadSavedUrls();

      // Update state
      setMetadata(meta);
      setContent(responseText);
      setSelectedUrl(sanitizedUrl);

    } catch (e: any) {
      error('Error fetching URL:', e);

      // Store raw error information
      setErrorInfo({
        error: e,
        context: 'Error fetching URL'
      });

      setMetadata({ error: 'Failed to fetch URL. See error details above.' });
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  // Load content for a selected URL
  const loadUrlContent = async (urlId: string) => {
    setLoading(true);
    // Clear any previous errors
    clearError();

    try {
      const metadataKey = METADATA_PREFIX + urlId;
      const contentKey = CONTENT_PREFIX + urlId;

      // Helper function to update state after metadata is loaded
      const handleMetadataLoaded = (value: string) => {
        try {
          setMetadata(JSON.parse(value));
        } catch (e) {
          error('Error parsing metadata JSON:', e);
          setErrorInfo({
            error: e,
            context: 'Error parsing metadata JSON'
          });
        }
      };

      // Helper function to update content state
      const handleContentLoaded = (value: string) => {
        setContent(value);
      };

      // Get values from storage
      await getValueFor(metadataKey, setLastOperation,
        () => {}, // No need to update key input
        handleMetadataLoaded
      );

      await getValueFor(contentKey, setLastOperation,
        () => {}, // No need to update key input
        handleContentLoaded
      );

      setSelectedUrl(urlId);
    } catch (e: any) {
      error('Error loading URL content:', e);
      setErrorInfo({
        error: e,
        context: 'Error loading URL content'
      });
      setMetadata({ error: 'Failed to load content. See error details above.' });
      setContent('');
    } finally {
      setLoading(false);
    }
  };

  // Error display component - shows raw error info
  const RawErrorDisplay = () => {
    if (!errorInfo) return null;

    // Function to safely stringify error objects
    const errorToString = (err: any): string => {
      try {
        // Extract all properties including non-enumerable ones
        const propertyNames = Object.getOwnPropertyNames(err);
        const errorObj: any = {};

        propertyNames.forEach(prop => {
          try {
            errorObj[prop] = err[prop];
          } catch (e) {
            errorObj[prop] = "Unable to extract property";
          }
        });

        // Special cases for specific error properties
        if (err.stack) errorObj.stack = err.stack;
        if (err.message) errorObj.message = err.message;
        if (err.name) errorObj.name = err.name;

        return JSON.stringify(errorObj, null, 2);
      } catch (e) {
        // Fallback if JSON.stringify fails
        return String(err);
      }
    };

    // Check if this is likely a CORS error (for highlighting only)
    const isCorsError =
      errorInfo.error?.message?.includes('CORS') ||
      errorInfo.error?.message?.includes('cross-origin') ||
      (errorInfo.error?.name === 'TypeError' && errorInfo.error?.message?.includes('Failed to fetch')) ||
      errorInfo.error?.message?.includes('access-control-allow-origin');

    return (
      <View style={[styles.errorContainer, isCorsError && styles.corsErrorHighlight]}>
        <ThemedText style={styles.errorContext}>
          {errorInfo.context}
          {isCorsError ? ' (CORS ERROR DETECTED)' : ''}
        </ThemedText>

        <ScrollView style={styles.rawErrorScroll}>
          <ThemedText style={styles.rawError}>
            {errorToString(errorInfo.error)}
          </ThemedText>
        </ScrollView>

        <TouchableOpacity
          style={styles.dismissButton}
          onPress={clearError}
        >
          <ThemedText style={styles.dismissButtonText}>Dismiss</ThemedText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="Enter URL"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="url"
        />
        <Button title="Get" onPress={fetchUrl} disabled={loading} />
      </View>

      {/* Display raw error information if present */}
      <RawErrorDisplay />

      <View style={styles.layout}>
        <View style={styles.sidebar}>
          <ThemedText style={styles.sectionTitle}>Saved URLs</ThemedText>
          <ScrollView style={styles.urlList}>
            {savedUrls.length === 0 ? (
              <ThemedText style={styles.emptyText}>No saved URLs yet</ThemedText>
            ) : (
              savedUrls.map((urlId) => (
                <TouchableOpacity
                  key={urlId}
                  style={[
                    styles.urlItem,
                    selectedUrl === urlId && styles.selectedUrl
                  ]}
                  onPress={() => loadUrlContent(urlId)}
                >
                  <ThemedText numberOfLines={1} ellipsizeMode="middle">
                    {urlId}
                  </ThemedText>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        <View style={styles.contentArea}>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : (
            <>
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Metadata</ThemedText>
                <ScrollView style={styles.metadataContainer}>
                  {metadata ? (
                    <ThemedText style={styles.preformatted}>
                      {JSON.stringify(metadata, null, 2)}
                    </ThemedText>
                  ) : (
                    <ThemedText style={styles.emptyText}>No metadata available</ThemedText>
                  )}
                </ScrollView>
              </View>

              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Response Body</ThemedText>
                <ScrollView style={styles.responseContainer}>
                  {content ? (
                    <ThemedText style={styles.preformatted}>{content}</ThemedText>
                  ) : (
                    <ThemedText style={styles.emptyText}>No content available</ThemedText>
                  )}
                </ScrollView>
              </View>
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginRight: 8,
  },
  layout: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 150,
    marginRight: 16,
  },
  contentArea: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  urlList: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    flex: 1,
  },
  urlItem: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedUrl: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  section: {
    flex: 1,
    marginBottom: 16,
  },
  metadataContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
    flex: 1,
  },
  responseContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
    flex: 1,
  },
  preformatted: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  emptyText: {
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  errorContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    marginBottom: 16,
    padding: 8,
  },
  errorContext: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rawErrorScroll: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#eee',
    padding: 8,
  },
  rawError: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  dismissButton: {
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 14,
  },
  corsErrorHighlight: {
    borderColor: '#ff0000',
    borderWidth: 2,
  },
});