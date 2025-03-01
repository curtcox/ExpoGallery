import React from 'react';
import { StyleSheet, FlatList, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import resourcesData from '../../assets/json/resources.json';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function ResourcesScreen() {
  const colorScheme = useColorScheme();

  const navigateToResource = (id: string) => {
    router.push(`/resource?id=${id}`);
  };

  const renderResourceItem = ({ item }: { item: typeof resourcesData.resources[0] }) => (
    <TouchableOpacity
      style={styles.resourceCard}
      onPress={() => navigateToResource(item.id)}
    >
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <ThemedText type="subtitle" style={styles.resourceName}>{item.name}</ThemedText>
          <View style={[
            styles.categoryBadge,
            { backgroundColor: Colors[colorScheme ?? 'light'].tint }
          ]}>
            <ThemedText style={styles.categoryText}>{item.category}</ThemedText>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <ThemedText style={styles.detailText}>{item.location.address}</ThemedText>
          <ThemedText style={styles.detailText}>{item.hours}</ThemedText>
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

  return (
    <View style={styles.container}>
      <ThemedText type="title" style={styles.screenTitle}>Resources</ThemedText>

      <FlatList
        data={resourcesData.resources}
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
  screenTitle: {
    marginBottom: 16,
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
  detailText: {
    marginBottom: 4,
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