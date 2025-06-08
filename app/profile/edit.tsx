import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserProfile } from '@/hooks/useUserProfile';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import { theme } from '@/constants/theme';
import { Save, User, Mail, Cake, Ruler, Weight } from 'lucide-react-native';
import { CookingSkillLevel, ActivityLevel } from '@/types';

export default function EditProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile } = useUserProfile();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [cookingSkillLevel, setCookingSkillLevel] = useState<CookingSkillLevel>('beginner');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderately-active');
  const [servingSizePreference, setServingSizePreference] = useState('2');
  const [weeklyMealFrequency, setWeeklyMealFrequency] = useState('7');

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setEmail(profile.email || '');
      setAge(profile.age?.toString() || '');
      setHeight(profile.height?.toString() || '');
      setWeight(profile.weight?.toString() || '');
      setTargetWeight(profile.targetWeight?.toString() || '');
      setCookingSkillLevel(profile.cookingSkillLevel || 'beginner');
      setActivityLevel(profile.activityLevel || 'moderately-active');
      setServingSizePreference(profile.servingSizePreference?.toString() || '2');
      setWeeklyMealFrequency(profile.weeklyMealFrequency?.toString() || '7');
    }
  }, [profile]);

  const skillLevels: CookingSkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
  const activityLevels: ActivityLevel[] = ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'];

  const handleSave = async () => {
    try {
      const updatedData = {
        name: name.trim(),
        email: email.trim(),
        age: age ? parseInt(age) : undefined,
        height: height ? parseInt(height) : undefined,
        weight: weight ? parseInt(weight) : undefined,
        targetWeight: targetWeight ? parseInt(targetWeight) : undefined,
        cookingSkillLevel,
        activityLevel,
        servingSizePreference: parseInt(servingSizePreference),
        weeklyMealFrequency: parseInt(weeklyMealFrequency),
      };

      await updateProfile(updatedData);
      
      Alert.alert('Success', 'Your profile has been updated!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    }
  };

  const formatLabel = (text: string) => {
    return text.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <ScreenContainer>
      <Header 
        title="Edit Profile" 
        showBack 
        onBackPress={() => router.back()} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <User size={16} color={theme.colors.gray[600]} />
              <Text style={styles.inputLabel}>Name</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={theme.colors.gray[400]}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Mail size={16} color={theme.colors.gray[600]} />
              <Text style={styles.inputLabel}>Email</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.gray[400]}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Cake size={16} color={theme.colors.gray[600]} />
              <Text style={styles.inputLabel}>Age</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={age}
              onChangeText={setAge}
              placeholder="Enter your age"
              placeholderTextColor={theme.colors.gray[400]}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Physical Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Physical Information</Text>
          
          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Ruler size={16} color={theme.colors.gray[600]} />
              <Text style={styles.inputLabel}>Height (cm)</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={height}
              onChangeText={setHeight}
              placeholder="Enter your height in cm"
              placeholderTextColor={theme.colors.gray[400]}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Weight size={16} color={theme.colors.gray[600]} />
              <Text style={styles.inputLabel}>Current Weight (kg)</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter your current weight in kg"
              placeholderTextColor={theme.colors.gray[400]}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputLabelContainer}>
              <Weight size={16} color={theme.colors.gray[600]} />
              <Text style={styles.inputLabel}>Target Weight (kg)</Text>
            </View>
            <TextInput
              style={styles.textInput}
              value={targetWeight}
              onChangeText={setTargetWeight}
              placeholder="Enter your target weight in kg"
              placeholderTextColor={theme.colors.gray[400]}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Cooking & Lifestyle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cooking & Lifestyle</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cooking Skill Level</Text>
            <View style={styles.optionsGrid}>
              {skillLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.optionButton,
                    cookingSkillLevel === level && styles.optionButtonSelected,
                  ]}
                  onPress={() => setCookingSkillLevel(level)}
                >
                  <Text style={[
                    styles.optionText,
                    cookingSkillLevel === level && styles.optionTextSelected,
                  ]}>
                    {formatLabel(level)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Activity Level</Text>
            <View style={styles.optionsGrid}>
              {activityLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.optionButton,
                    activityLevel === level && styles.optionButtonSelected,
                  ]}
                  onPress={() => setActivityLevel(level)}
                >
                  <Text style={[
                    styles.optionText,
                    activityLevel === level && styles.optionTextSelected,
                  ]}>
                    {formatLabel(level)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Serving Size Preference</Text>
            <TextInput
              style={styles.textInput}
              value={servingSizePreference}
              onChangeText={setServingSizePreference}
              placeholder="Number of servings"
              placeholderTextColor={theme.colors.gray[400]}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Weekly Meal Frequency</Text>
            <TextInput
              style={styles.textInput}
              value={weeklyMealFrequency}
              onChangeText={setWeeklyMealFrequency}
              placeholder="Meals per week"
              placeholderTextColor={theme.colors.gray[400]}
              keyboardType="numeric"
            />
          </View>
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.saveContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="white" />
          <Text style={styles.saveButtonText}>Save Changes</Text>
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
    marginBottom: theme.spacing.md,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.text,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: 'white',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: 'white',
  },
  optionButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
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