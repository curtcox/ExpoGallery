import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Profile, profile, updateProfile, subscribeToProfileChanges } from '@/storage/profile';
import { Picker } from '@react-native-picker/picker';

export default function ProfileScreen() {
  const [profileData, setProfileData] = useState<Profile>({ ...profile });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Subscribe to profile changes
    const unsubscribe = subscribeToProfileChanges((newProfile) => {
      setProfileData(newProfile);
    });

    return unsubscribe;
  }, []);

  const handleChange = (field: keyof Profile, value: string | number) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(profileData);
      setIsEditing(false);
    } catch (e) {
      console.error('Failed to save profile:', e);
    } finally {
      setIsSaving(false);
    }
  };

  const renderEditButton = () => (
    <TouchableOpacity
      style={styles.button}
      onPress={() => isEditing ? handleSave() : setIsEditing(true)}
      disabled={isSaving}
    >
      <ThemedText type="default" style={styles.buttonText}>
        {isEditing ? (isSaving ? 'Saving...' : 'Save') : 'Edit Profile'}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderField = (label: string, field: keyof Profile, type: 'text' | 'number' | 'gender' = 'text') => {
    // For view mode
    if (!isEditing) {
      return (
        <View style={styles.fieldContainer}>
          <ThemedText type="subtitle" style={styles.label}>{label}</ThemedText>
          <ThemedText type="default" style={styles.value}>
            {type === 'number' && profileData[field] === 0
              ? '-'
              : String(profileData[field] || '-')}
          </ThemedText>
        </View>
      );
    }

    // For edit mode
    if (type === 'gender') {
      return (
        <View style={styles.fieldContainer}>
          <ThemedText type="subtitle" style={styles.label}>{label}</ThemedText>
          <View style={styles.inputContainer}>
            <Picker
              selectedValue={profileData.gender}
              onValueChange={(value) => handleChange('gender', value)}
              style={styles.picker}
            >
              <Picker.Item label="Select" value="" />
              <Picker.Item label="Male" value="male" />
              <Picker.Item label="Female" value="female" />
              <Picker.Item label="Non-binary" value="non-binary" />
              <Picker.Item label="Prefer not to say" value="unspecified" />
            </Picker>
          </View>
        </View>
      );
    }

    if (type === 'number') {
      return (
        <View style={styles.fieldContainer}>
          <ThemedText type="subtitle" style={styles.label}>{label}</ThemedText>
          <TextInput
            style={styles.input}
            value={profileData[field] ? String(profileData[field]) : ''}
            onChangeText={(text) => {
              const numValue = text === '' ? 0 : parseInt(text, 10);
              if (!isNaN(numValue)) {
                handleChange(field, numValue);
              }
            }}
            keyboardType="numeric"
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
        </View>
      );
    }

    return (
      <View style={styles.fieldContainer}>
        <ThemedText type="subtitle" style={styles.label}>{label}</ThemedText>
        <TextInput
          style={styles.input}
          value={String(profileData[field] || '')}
          onChangeText={(text) => handleChange(field, text)}
          placeholder={`Enter your ${label.toLowerCase()}`}
          keyboardType={field === 'email' ? 'email-address' : field === 'phone' ? 'phone-pad' : 'default'}
        />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.scrollContainer}>
        <ThemedText type="title" style={styles.header}>Profile</ThemedText>

        <View style={styles.profileSection}>
          {renderField('Name', 'name')}
          {renderField('Email', 'email')}
          {renderField('Phone', 'phone')}
          {renderField('Address', 'address')}
          {renderField('City', 'city')}
          {renderField('State', 'state')}
          {renderField('Age', 'age', 'number')}
          {renderField('Gender', 'gender', 'gender')}
        </View>

        {renderEditButton()}

        {isEditing && (
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              setProfileData({ ...profile }); // Reset to current profile
              setIsEditing(false);
            }}
          >
            <ThemedText type="default" style={styles.buttonText}>Cancel</ThemedText>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 60,
    marginBottom: 20,
  },
  profileSection: {
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
    marginRight: 10,
  },
  value: {
    flex: 2,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(200, 200, 200, 0.05)',
    borderRadius: 4,
  },
  input: {
    flex: 2,
    padding: 12,
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
    borderRadius: 4,
    fontSize: 16,
  },
  inputContainer: {
    flex: 2,
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
    borderRadius: 4,
  },
  pickerContainer: {
    backgroundColor: 'rgba(200, 200, 200, 0.1)',
    borderRadius: 4,
    flex: 2,
  },
  picker: {
    height: 50,
    width: '100%',
  },
  button: {
    backgroundColor: 'rgba(100, 100, 255, 0.2)',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 100, 100, 0.2)',
  },
  buttonText: {
    fontWeight: 'bold',
  },
});