import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useMemo } from 'react';
import { Link } from 'expo-router';
import { info } from '../../utils/logger';
import { Checkbox } from 'react-native-paper';
import { ALL_EXAMPLES, ExampleItem } from '@/utils/examples';
import { subscribeToSettingsChanges, updateSettings, currentSettings } from '@/storage/settings';
import { FlashList } from '@shopify/flash-list';
import { useColorScheme } from 'react-native';

export default function GalleryScreen() {
  const colorScheme = useColorScheme();
  const [examples, setExamples] = useState<ExampleItem[]>(
    ALL_EXAMPLES.map(example => ({ ...example, selected: false }))
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Get top 5 most frequently used icon types
  const topIconTypes = useMemo(() => {
    // Count frequency of each icon
    const iconCounts: Record<string, number> = {};
    ALL_EXAMPLES.forEach(example => {
      const icon = example.icon;
      iconCounts[icon] = (iconCounts[icon] || 0) + 1;
    });

    // Sort by frequency and take top 5
    return Object.entries(iconCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([icon]) => icon);
  }, []);

  // Initialize with all top icons selected
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());

  // Set all top icons as selected on initial render
  useEffect(() => {
    if (topIconTypes.length > 0) {
      setSelectedIcons(new Set(topIconTypes));
    }
  }, [topIconTypes]);

  useEffect(() => {
    info('Viewing Gallery');

    // Load saved focused examples from settings
    const loadFocusedExamples = () => {
      const settings = currentSettings();
      const selectedNames = settings.focusedExamples || [];

      setExamples(prev => prev.map(example => ({
        ...example,
        selected: selectedNames.includes(example.name)
      })));
    };

    loadFocusedExamples();

    // Subscribe to settings changes
    const unsubscribe = subscribeToSettingsChanges((settings) => {
      const selectedNames = settings.focusedExamples || [];
      setExamples(prev => prev.map(example => ({
        ...example,
        selected: selectedNames.includes(example.name)
      })));
    });

    return () => unsubscribe();
  }, []);

  const toggleExample = (index: number) => {
    const updatedExamples = [...examples];
    updatedExamples[index].selected = !updatedExamples[index].selected;
    setExamples(updatedExamples);

    // Save to settings
    const selectedNames = updatedExamples
      .filter(example => example.selected)
      .map(example => example.name);

    updateSettings({ focusedExamples: selectedNames })
      .catch(error => console.error('Failed to save focused examples:', error));
  };

  const toggleIconFilter = (iconName: string) => {
    setSelectedIcons(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(iconName)) {
        newSelected.delete(iconName);
      } else {
        newSelected.add(iconName);
      }
      return newSelected;
    });
  };

  const renderItem = ({ item, index }: { item: ExampleItem; index: number }) => {
    return exampleRow(
      item.name,
      item.text,
      item.icon as any,
      item.url,
      item.selected ?? false,
      () => toggleExample(index),
      index
    );
  };

  // Filter examples based on search term and selected icons
  const filteredExamples = useMemo(() => {
    let filtered = examples;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(example =>
        example.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        example.text.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected icons
    if (selectedIcons.size > 0) {
      filtered = filtered.filter(example =>
        selectedIcons.has(example.icon)
      );
    }

    return filtered;
  }, [examples, searchTerm, selectedIcons]);

  const renderIconFilterChip = (iconName: string) => {
    const isSelected = selectedIcons.has(iconName);
    const chipColor = isSelected ? '#3498db' : '#e0e0e0';
    const textColor = isSelected ? '#ffffff' : '#333333';

    return (
      <TouchableOpacity
        key={iconName}
        style={[
          styles.iconChip,
          { backgroundColor: chipColor }
        ]}
        onPress={() => toggleIconFilter(iconName)}
      >
        <Ionicons
          name={iconName as any}
          size={24}
          color={textColor}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search examples..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          clearButtonMode="while-editing"
        />
      </View>

      <View style={styles.filtersContainer}>
        <Text style={styles.filterTitle}>Filter by icon:</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.iconFiltersRow}
        >
          {topIconTypes.map(iconName => renderIconFilterChip(iconName))}
        </ScrollView>
      </View>

      <FlashList
        data={filteredExamples}
        renderItem={renderItem}
        estimatedItemSize={60}
        keyExtractor={(item) => item.name}
      />
    </View>
  );
}

function exampleRow(
  name: string,
  text: string,
  icon: any,
  url: string,
  selected: boolean,
  onToggle: () => void,
  key: number
) {
  const examplePage = `/examples/${name}`;
  const docUrl = url.startsWith('https') ? url : `https://docs.expo.dev/${url}`;

  return (
    <View style={styles.linkRow} key={key}>
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={selected ? 'checked' : 'unchecked'}
          onPress={onToggle}
        />
      </View>
      <Ionicons name={icon} size={24} color="black" style={styles.icon} />
      <View style={styles.docsLinkContainer}>
        <Link href={docUrl as any} style={styles.docsLink}>Docs</Link>
      </View>
      <View style={styles.primaryLinkContainer}>
        <Link href={examplePage as any} style={styles.primaryLink}>
          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.linkText}>
            {text}
          </Text>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    paddingBottom: 8,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  iconFiltersRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  iconChip: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    width: '100%',
  },
  checkboxContainer: {
    marginRight: 0,
    paddingRight: 0,
  },
  icon: {
    marginLeft: 8,
    width: 24,
  },
  docsLinkContainer: {
    marginLeft: 12,
    width: 50,
  },
  docsLink: {
    fontSize: 14,
  },
  primaryLinkContainer: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-end',
  },
  primaryLink: {
    maxWidth: '100%',
  },
  linkText: {
    fontSize: 14,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
