import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import * as Cellular from 'expo-cellular';
import { info } from '@/utils/logger';

export default function Example() {
  const [carrierName, setCarrierName] = useState<string | null>(null);
  const [cellularGeneration, setCellularGeneration] = useState<string | null>(null);
  const [allowsVoip, setAllowsVoip] = useState<boolean | null>(null);
  const [isoCountryCode, setIsoCountryCode] = useState<string | null>(null);
  const [mobileCountryCode, setMobileCountryCode] = useState<string | null>(null);
  const [mobileNetworkCode, setMobileNetworkCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function getCellularInfo() {
      try {
        // First check/request permissions on Android
        const { status } = await Cellular.getPermissionsAsync();

        if (status !== 'granted') {
          const { status: newStatus } = await Cellular.requestPermissionsAsync();
          setHasPermission(newStatus === 'granted');
        } else {
          setHasPermission(true);
        }

        // Get carrier name
        const name = await Cellular.getCarrierNameAsync();
        setCarrierName(name);

        // Get cellular generation
        try {
          const generation = await Cellular.getCellularGenerationAsync();
          switch (generation) {
            case Cellular.CellularGeneration.CELLULAR_2G:
              setCellularGeneration('2G');
              break;
            case Cellular.CellularGeneration.CELLULAR_3G:
              setCellularGeneration('3G');
              break;
            case Cellular.CellularGeneration.CELLULAR_4G:
              setCellularGeneration('4G');
              break;
            case Cellular.CellularGeneration.CELLULAR_5G:
              setCellularGeneration('5G');
              break;
            default:
              setCellularGeneration('Unknown');
          }
        } catch (err) {
          info('Error getting cellular generation:', err);
          setCellularGeneration('Error');
        }

        // Get VoIP support
        const voipSupport = await Cellular.allowsVoipAsync();
        setAllowsVoip(voipSupport);

        // Get ISO country code
        const iso = await Cellular.getIsoCountryCodeAsync();
        setIsoCountryCode(iso);

        // Get mobile country code
        const mcc = await Cellular.getMobileCountryCodeAsync();
        setMobileCountryCode(mcc);

        // Get mobile network code
        const mnc = await Cellular.getMobileNetworkCodeAsync();
        setMobileNetworkCode(mnc);
      } catch (err) {
        info('Error getting cellular info:', err);
        setError('Error fetching cellular information');
      } finally {
        setLoading(false);
      }
    }

    getCellularInfo();
  }, []);

  function renderInfoItem(label: string, value: string | boolean | null) {
    return (
      <View style={styles.infoRow}>
        <ThemedText style={styles.label}>{label}:</ThemedText>
        <ThemedText style={styles.value}>
          {value === null ? 'Not available' : value.toString()}
        </ThemedText>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <ThemedText style={styles.loadingText}>Loading cellular information...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <ThemedText style={styles.title}>Cellular Information</ThemedText>

      {hasPermission === false && (
        <ThemedText style={styles.permissionText}>
          Permission to access cellular data not granted. Some information may not be available.
        </ThemedText>
      )}

      <View style={styles.card}>
        {renderInfoItem('Carrier Name', carrierName)}
        {renderInfoItem('Cellular Generation', cellularGeneration)}
        {renderInfoItem('VoIP Allowed', allowsVoip)}
        {renderInfoItem('ISO Country Code', isoCountryCode)}
        {renderInfoItem('Mobile Country Code', mobileCountryCode)}
        {renderInfoItem('Mobile Network Code', mobileNetworkCode)}
      </View>

      <ThemedText style={styles.note}>
        Note: Some information may not be available on simulators, in airplane mode, or when no SIM card is present.
      </ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  card: {
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 14,
    color: 'orange',
    marginBottom: 16,
    textAlign: 'center',
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 8,
  },
});