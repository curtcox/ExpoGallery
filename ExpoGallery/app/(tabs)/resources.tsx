import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity, ScrollView, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { getAllResources, Resource } from '@/services/data';
import deviceLocationService from '@/services/deviceLocation.native';
import { calculateDistance } from '@/services/location';
import { FontAwesome } from '@expo/vector-icons';

export default function ResourcesScreen() {
  const colorScheme = useColorScheme();
  const resources = getAllResources();
  const [userLocation, setUserLocation] = useState(deviceLocationService.getLastKnownLocation());

  const topCategories = useMemo(() => getTopCategoriesByFrequency(resources), [resources]);

  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(() =>
    new Set(topCategories)
  );

  // Calculate distances and sort resources
  const filteredResources = useMemo(() => {
    const resourcesWithCategories = filterResourcesByCategories(resources, selectedCategories);

    // Add distance from user if location is available
    if (userLocation) {
      try {
        return resourcesWithCategories.map(resource => ({
          ...resource,
          distance: calculateDistance(
            { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
            { latitude: resource.location.latitude, longitude: resource.location.longitude }
          ) / 1000 // Convert from meters to kilometers
        }))
        .sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
      } catch (e) {
        console.error('Error calculating distances:', e);
        return resourcesWithCategories;
      }
    }

    return resourcesWithCategories;
  }, [resources, selectedCategories, userLocation]);

  // Initialize location services and set up listener
  useEffect(() => {
    let mounted = true;

    // Initialize location watching in the background
    const initializeLocation = async () => {
      try {
        await deviceLocationService.initLocationWatching();

        // Get the current location (which may update the cached location)
        const location = await deviceLocationService.getCurrentLocation();
        if (location && mounted) {
          setUserLocation(location);
        }
      } catch (e) {
        console.error('Error initializing location:', e);
      }
    };

    initializeLocation();

    return () => {
      mounted = false;
      deviceLocationService.stopLocationWatching();
    };
  }, []);

  function getTopCategoriesByFrequency(resources: Resource[]): string[] {
    const categoryCountMap: Record<string, number> = {};

    resources.forEach(resource => {
      const category = resource.category;
      categoryCountMap[category] = (categoryCountMap[category] || 0) + 1;
    });

    return Object.entries(categoryCountMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category]) => category);
  }

  function filterResourcesByCategories(resources: Resource[], selectedCategories: Set<string>): Resource[] {
    if (selectedCategories.size === 0) {
      return resources; // Show all resources if no categories selected
    }

    return resources.filter(resource =>
      selectedCategories.has(resource.category)
    );
  }

  function toggleCategorySelection(category: string) {
    setSelectedCategories(prevSelected => {
      const newSelected = new Set(prevSelected);
      if (newSelected.has(category)) {
        newSelected.delete(category);
      } else {
        newSelected.add(category);
      }
      return newSelected;
    });
  }

  function navigateToResource(id: string) {
    router.push(`/resource?id=${id}`);
  }

  function renderResourceItem({ item }: { item: Resource & { distance?: number } }) {
    const tintColor = Colors[colorScheme ?? 'light'].tint;
    return (
      <TouchableOpacity
        style={styles.resourceCard}
        onPress={() => navigateToResource(item.id)}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <ThemedText type="subtitle" style={styles.resourceName}>{item.name}</ThemedText>
            <View style={[
              styles.categoryBadge,
              { backgroundColor: tintColor }
            ]}>
              <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
            </View>
          </View>

          <View style={styles.cardDetails}>
            <View style={styles.locationRow}>
              <FontAwesome name="map-marker" size={16} color={tintColor} style={styles.locationIcon} />
              <ThemedText style={styles.detailText}>{item.location.address}</ThemedText>
            </View>

            <ThemedText style={styles.detailText}>{item.hours}</ThemedText>

            {item.distance !== undefined && (
              <View style={[styles.distanceContainer, { borderColor: tintColor }]}>
                <FontAwesome name="location-arrow" size={14} color={tintColor} style={styles.distanceIcon} />
                <ThemedText style={[styles.distanceText, { color: tintColor }]}>
                  {item.distance.toFixed(1)} km away
                </ThemedText>
              </View>
            )}

            <ThemedText style={styles.detailText} numberOfLines={2}>
              {item.details}
            </ThemedText>
          </View>

          <View style={styles.cardFooter}>
            <ThemedText style={styles.ratingText}>Rating: {item.averageRating} ★</ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  function renderCategoryFilterChip(category: string) {
    const isSelected = selectedCategories.has(category);
    const tintColor = Colors[colorScheme ?? 'light'].tint;

    return (
      <TouchableOpacity
        key={category}
        style={[
          styles.checkboxContainer,
          isSelected && {
            backgroundColor: `${tintColor}20`, // Using alpha for background
            borderColor: tintColor,
            borderWidth: 1,
          }
        ]}
        onPress={() => toggleCategorySelection(category)}
      >
        <ThemedText
          style={[
            styles.checkboxLabel,
            isSelected && {
              fontWeight: '600',
              color: isSelected ? tintColor : undefined
            }
          ]}
        >
          {category}
        </ThemedText>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.screenHeader}>
        <ThemedText type="title" style={styles.screenTitle}>Resources</ThemedText>
        {userLocation ? (
          <View style={styles.locationBadge}>
            <FontAwesome name="location-arrow" size={12} color="#fff" style={styles.locationBadgeIcon} />
            <Text style={styles.locationBadgeText}>Sorted by distance</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.filterSection}>
        <ThemedText style={styles.filterTitle}>Filter by category:</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {topCategories.map(category => renderCategoryFilterChip(category))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredResources}
        renderItem={renderResourceItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  screenTitle: {
    marginBottom: 0,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  locationBadgeIcon: {
    marginRight: 4,
  },
  locationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterSection: {
    marginBottom: 16,
  },
  filterTitle: {
    marginBottom: 8,
    fontWeight: '600',
  },
  categoriesContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  checkboxLabel: {
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  resourceCard: {
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  resourceName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  cardDetails: {
    marginBottom: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  locationIcon: {
    marginRight: 6,
  },
  detailText: {
    marginBottom: 4,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
    marginVertical: 6,
  },
  distanceIcon: {
    marginRight: 4,
  },
  distanceText: {
    fontWeight: '600',
    fontSize: 13,
  },
  cardFooter: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  ratingText: {
    fontWeight: 'bold',
  },
});