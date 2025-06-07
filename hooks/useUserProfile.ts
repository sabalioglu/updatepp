import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/types';
import { getUserProfile, saveUserProfile, initializeUserProfile } from '@/utils/storage';

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      await initializeUserProfile();
      const data = await getUserProfile();
      setProfile(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user profile'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updatedProfile: Partial<UserProfile>) => {
    try {
      if (!profile) return;
      
      const newProfile = {
        ...profile,
        ...updatedProfile,
        updatedAt: new Date().toISOString(),
      };
      
      await saveUserProfile(newProfile);
      setProfile(newProfile);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update user profile'));
    }
  }, [profile]);

  const resetProfile = useCallback(async () => {
    try {
      const defaultProfile: UserProfile = {
        id: 'user-1',
        name: '',
        dietaryPreferences: [],
        allergies: [],
        intolerances: [],
        dietaryRestrictions: [],
        cuisinePreferences: [],
        cookingSkillLevel: 'beginner',
        preferredMealTypes: [],
        weeklyMealFrequency: 7,
        servingSizePreference: 2,
        dislikedIngredients: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        onboardingCompleted: false,
        privacySettings: {
          shareHealthData: false,
          sharePreferences: true,
          allowAnalytics: true,
        },
      };
      
      await saveUserProfile(defaultProfile);
      setProfile(defaultProfile);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to reset user profile'));
    }
  }, []);

  return {
    profile,
    loading,
    error,
    updateProfile,
    resetProfile,
    refreshProfile: fetchProfile,
  };
}