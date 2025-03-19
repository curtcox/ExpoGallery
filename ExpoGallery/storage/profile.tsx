import { error, storage } from '@/utils/index';

export interface Profile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  age: number;
  gender: string;
  privateFields: string[];
  usesMetric: boolean;
}

export const defaultProfile: Profile = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  age: 0,
  gender: '',
  privateFields: [],
  usesMetric: false,
};

// Current profile state
export const profile: Profile = { ...defaultProfile };

// Key for storing profile in storage
const PROFILE_STORAGE_KEY = 'profile';

// Initialize profile from storage
export async function initProfile(): Promise<void> {
  try {
    const storedProfile = await storage.getItem(PROFILE_STORAGE_KEY);
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      Object.assign(profile, parsedProfile);
    }
  } catch (e) {
    // Log the error but continue with default profile
    error('Failed to load profile:', e);

    // Ensure the application can continue with default values
    Object.assign(profile, defaultProfile);
  }
}

// Update profile with new values
export async function updateProfile(newProfileData: Partial<Profile>): Promise<void> {

  // Update the in-memory profile
  Object.assign(profile, newProfileData);

  try {
    // Save to storage
    await storage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    // Notify subscribers
    notifyProfileSubscribers();
  } catch (e) {
    error('Failed to save profile:', e);
  }
}

// Type for profile change callback
type ProfileChangeCallback = (profile: Profile) => void;
// Array to store subscribers
const profileSubscribers: ProfileChangeCallback[] = [];

// Subscribe to profile changes
export function subscribeToProfileChanges(callback: ProfileChangeCallback): () => void {
  profileSubscribers.push(callback);

  // Call callback immediately with current profile
  callback({ ...profile });

  // Return unsubscribe function
  return () => {
    const index = profileSubscribers.indexOf(callback);
    if (index !== -1) {
      profileSubscribers.splice(index, 1);
    }
  };
}

// Notify all subscribers of profile changes
function notifyProfileSubscribers(): void {
  const profileCopy = { ...profile };
  profileSubscribers.forEach(callback => {
    try {
      callback(profileCopy);
    } catch (e) {
      error('Error in profile subscriber:', e);
    }
  });
}

// Initialize profile when module is imported
initProfile().catch(e => error('Failed to initialize profile:', e));