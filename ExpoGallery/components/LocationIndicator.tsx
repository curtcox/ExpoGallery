import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface LocationIndicatorProps {
  size?: number;
  top?: number;
  right?: number;
  hasLocation?: boolean | null;
}

/**
 * A component that displays a circle in the upper right corner
 * indicating whether the device's location is known or not.
 *
 * - Solid blue circle: Location is known
 * - Empty blue circle: Location is null/unknown
 */
const LocationIndicator: React.FC<LocationIndicatorProps> = ({
  size = 16,
  top = 50,
  right = 20,
  hasLocation = null,
}) => {
  const pulseAnim = useState(new Animated.Value(1))[0];

  // Start the pulse animation for the empty ring
  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    // Start pulse animation
    startPulseAnimation();
  }, []);

  return (
    <View style={[styles.container, { top, right }]}>
      {hasLocation === null ? (
        // Initial loading state - show nothing or a placeholder
        <View style={[styles.circle, { width: size, height: size, borderWidth: 1.5 }]} />
      ) : hasLocation ? (
        // Location is available - show solid blue circle
        <View style={[styles.circle, styles.solid, { width: size, height: size }]} />
      ) : (
        // Location is not available - show animated empty ring
        <Animated.View
          style={[
            styles.circle,
            styles.ring,
            {
              width: size,
              height: size,
              borderWidth: 1.5,
              transform: [{ scale: pulseAnim }]
            }
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    zIndex: 999,
  },
  circle: {
    borderRadius: 50,
    borderColor: '#2196F3', // Material Blue
  },
  solid: {
    backgroundColor: '#2196F3',
  },
  ring: {
    backgroundColor: 'transparent',
  }
});

export default LocationIndicator;