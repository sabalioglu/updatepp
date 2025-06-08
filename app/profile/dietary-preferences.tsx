import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserProfile } from '@/hooks/useUserProfile';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import { theme } from '@/constants/theme';
import { Check, Save } from 'lucide-react-native';
import { DietaryPreference, DietaryRestriction, HealthGoal } from '@/types';

export default function DietaryPreferencesScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useUserProfile();
  
  const [selectedPreferences, setSelectedPreferences] = useState<DietaryPreference[]>([]);
  const [selectedRestrictions, setSelectedRestrictions] = useState<DietaryRestriction[]>([]);
  const [selectedHealthGoals, setSelectedHealthGoals] = useState<HealthGoal[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setSelectedPreferences(profile.dietaryPreferences || []);
      setSelectedRestrictions(profile.dietaryRestrictions || []);
      setSelectedHealthGoals(profile.healthGoals || []);
      setSelectedAllergies(profile.allergies || []);
    }
  }, [profile]);

  const dietaryPreferences: DietaryPreference[] = ['vegetarian', 'vegan', 'pescatarian', 'flexitarian', 'omnivore'];
  const dietaryRestrictions: DietaryRestriction[] = [
    'gluten-free', 'dairy-free', 'nut-free', 'soy-free', 'egg-free', 'shellfish-free',
    'low-sodium', 'low-sugar', 'keto', 'paleo', 'whole30', 'mediterranean', 'dash', 'low-carb', 'low-fat'
  ];
  const healthGoals: HealthGoal[] = [
    'weight-loss', 'weight-gain', 'muscle-gain', 'maintenance', 'heart-health',
    'diabetes-management', 'digestive-health', 'energy-boost', 'immune-support'
  ];
  const commonAllergies = ['Peanuts', 'Tree nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Sesame'];

  const togglePreference = (preference: DietaryPreference) => {
    setSelectedPreferences(prev => 
      prev.includes(preference) 
        ? prev.filter(p => p !== preference)
        : [...prev, preference]
    );
  };

  const toggleRestriction = (restriction: DietaryRestriction) => {
    setSelectedRestrictions(prev => 
      prev.includes(restriction) 
        ? prev.filter(r => r !== restriction)
        : [...prev, restriction]
    );
  };

  const toggleHealthGoal = (goal: HealthGoal) => {
    setSelectedHealthGoals(prev => 
      prev.includes(goal) 
        ? prev.filter(g => g !== goal)
        : [...prev, goal]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies(prev => 
      prev.includes(allergy) 
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        dietaryPreferences: selectedPreferences,
        dietaryRestrictions: selectedRestrictions,
        healthGoals: selectedHealthGoals,
        allergies: selectedAllergies,
      });
      
      Alert.alert('Success', 'Your dietary preferences have been updated!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update preferences. Please try again.');
    }
  };

  const formatLabel = (text: string) => {
    return text.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <ScreenContainer>
      <Header 
        title="Dietary Preferences" 
        showBack 
        onBackPress={() => router.back()} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Dietary Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Preferences</Text>
          <Text style={styles.sectionDescription}>
            What best describes your eating style?
          </Text>
          <View style={styles.optionsGrid}>
            {dietaryPreferences.map((preference) => (
              <TouchableOpacity
                key={preference}
                style={[
                  styles.optionButton,
                  selectedPreferences.includes(preference) && styles.optionButtonSelected,
                ]}
                onPress={() => togglePreference(preference)}
              >
                {selectedPreferences.includes(preference) && (
                  <Check size={16} color="white" style={styles.checkIcon} />
                )}
                <Text style={[
                  styles.optionText,
                  selectedPreferences.includes(preference) && styles.optionTextSelected,
                ]}>
                  {formatLabel(preference)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Dietary Restrictions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
          <Text style={styles.sectionDescription}>
            Select any dietary restrictions that apply to you.
          </Text>
          <View style={styles.optionsGrid}>
            {dietaryRestrictions.map((restriction) => (
              <TouchableOpacity
                key={restriction}
                style={[
                  styles.optionButton,
                  selectedRestrictions.includes(restriction) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleRestriction(restriction)}
              >
                {selectedRestrictions.includes(restriction) && (
                  <Check size={16} color="white" style={styles.checkIcon} />
                )}
                <Text style={[
                  styles.optionText,
                  selectedRestrictions.includes(restriction) && styles.optionTextSelected,
                ]}>
                  {formatLabel(restriction)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Allergies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Food Allergies</Text>
          <Text style={styles.sectionDescription}>
            Help us keep you safe by selecting any food allergies.
          </Text>
          <View style={styles.optionsGrid}>
            {commonAllergies.map((allergy) => (
              <TouchableOpacity
                key={allergy}
                style={[
                  styles.optionButton,
                  selectedAllergies.includes(allergy) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleAllergy(allergy)}
              >
                {selectedAllergies.includes(allergy) && (
                  <Check size={16} color="white" style={styles.checkIcon} />
                )}
                <Text style={[
                  styles.optionText,
                  selectedAllergies.includes(allergy) && styles.optionTextSelected,
                ]}>
                  {allergy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Goals</Text>
          <Text style={styles.sectionDescription}>
            What are your current health and wellness goals?
          </Text>
          <View style={styles.optionsGrid}>
            {healthGoals.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.optionButton,
                  selectedHealthGoals.includes(goal) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleHealthGoal(goal)}
              >
                {selectedHealthGoals.includes(goal) && (
                  <Check size={16} color="white" style={styles.checkIcon} />
                )}
                <Text style={[
                  styles.optionText,
                  selectedHealthGoals.includes(goal) && styles.optionTextSelected,
                ]}>
                  {formatLabel(goal)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="white" />
          <Text style={styles.saveButtonText}>Save Preferences</Text>
        </TouchableOpacity>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  sectionDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.md,
    lineHeight: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'white',
    minHeight: 40,
  },
  optionButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  checkIcon: {
    marginRight: theme.spacing.xs,
  },
  optionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.text,
  },
  optionTextSelected: {
    color: 'white',
  },
  saveContainer: {
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    backgroundColor: theme.colors.background,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    ...theme.shadows.md,
  },
  saveButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
});