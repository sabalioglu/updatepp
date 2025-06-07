import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { UserProfile, DietaryPreference, DietaryRestriction, CookingSkillLevel, MealType, HealthGoal, ActivityLevel } from '@/types';
import { theme } from '@/constants/theme';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react-native';

interface OnboardingModalProps {
  visible: boolean;
  onComplete: (profile: Partial<UserProfile>) => void;
  onSkip: () => void;
  initialProfile: UserProfile | null;
}

interface OnboardingStep {
  id: string;
  title: string;
  subtitle: string;
  component: React.ReactNode;
}

export default function OnboardingModal({ visible, onComplete, onSkip, initialProfile }: OnboardingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [profileData, setProfileData] = useState<Partial<UserProfile>>({
    name: initialProfile?.name || '',
    dietaryPreferences: initialProfile?.dietaryPreferences || [],
    allergies: initialProfile?.allergies || [],
    intolerances: initialProfile?.intolerances || [],
    dietaryRestrictions: initialProfile?.dietaryRestrictions || [],
    cuisinePreferences: initialProfile?.cuisinePreferences || [],
    cookingSkillLevel: initialProfile?.cookingSkillLevel || 'beginner',
    preferredMealTypes: initialProfile?.preferredMealTypes || [],
    weeklyMealFrequency: initialProfile?.weeklyMealFrequency || 7,
    servingSizePreference: initialProfile?.servingSizePreference || 2,
    dislikedIngredients: initialProfile?.dislikedIngredients || [],
    healthGoals: initialProfile?.healthGoals || [],
    activityLevel: initialProfile?.activityLevel,
    height: initialProfile?.height,
    weight: initialProfile?.weight,
    targetWeight: initialProfile?.targetWeight,
    age: initialProfile?.age,
    gender: initialProfile?.gender,
    dailyCaloricNeeds: initialProfile?.dailyCaloricNeeds,
  });

  const updateProfileData = (key: keyof UserProfile, value: any) => {
    setProfileData(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = <T,>(key: keyof UserProfile, item: T) => {
    const currentArray = (profileData[key] as T[]) || [];
    const newArray = currentArray.includes(item)
      ? currentArray.filter(i => i !== item)
      : [...currentArray, item];
    updateProfileData(key, newArray);
  };

  const dietaryPreferences: DietaryPreference[] = ['vegetarian', 'vegan', 'pescatarian', 'flexitarian', 'omnivore'];
  const dietaryRestrictions: DietaryRestriction[] = [
    'gluten-free', 'dairy-free', 'nut-free', 'soy-free', 'egg-free', 'shellfish-free',
    'low-sodium', 'low-sugar', 'keto', 'paleo', 'whole30', 'mediterranean', 'dash', 'low-carb', 'low-fat'
  ];
  const cuisines = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'American', 'French', 'Thai', 'Japanese', 'Middle Eastern'];
  const skillLevels: CookingSkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
  const healthGoals: HealthGoal[] = [
    'weight-loss', 'weight-gain', 'muscle-gain', 'maintenance', 'heart-health',
    'diabetes-management', 'digestive-health', 'energy-boost', 'immune-support'
  ];
  const activityLevels: ActivityLevel[] = ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extremely-active'];
  const commonAllergies = ['Peanuts', 'Tree nuts', 'Milk', 'Eggs', 'Wheat', 'Soy', 'Fish', 'Shellfish', 'Sesame'];
  const commonDislikes = ['Mushrooms', 'Onions', 'Cilantro', 'Olives', 'Tomatoes', 'Seafood', 'Spicy food', 'Coconut'];

  const steps: OnboardingStep[] = [
    {
      id: 'basic',
      title: 'Welcome to Pantry Pal!',
      subtitle: "Let's start with your basic information",
      component: (
        <View style={styles.stepContent}>
          <Text style={styles.inputLabel}>What should we call you?</Text>
          <TextInput
            style={styles.textInput}
            value={profileData.name}
            onChangeText={(text) => updateProfileData('name', text)}
            placeholder="Enter your name"
            placeholderTextColor={theme.colors.gray[400]}
          />
        </View>
      ),
    },
    {
      id: 'dietary',
      title: 'Dietary Preferences',
      subtitle: 'Tell us about your eating style',
      component: (
        <View style={styles.stepContent}>
          <Text style={styles.sectionTitle}>What best describes your diet?</Text>
          <View style={styles.optionsGrid}>
            {dietaryPreferences.map((pref) => (
              <TouchableOpacity
                key={pref}
                style={[
                  styles.optionButton,
                  profileData.dietaryPreferences?.includes(pref) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleArrayItem('dietaryPreferences', pref)}
              >
                <Text style={[
                  styles.optionText,
                  profileData.dietaryPreferences?.includes(pref) && styles.optionTextSelected,
                ]}>
                  {pref.charAt(0).toUpperCase() + pref.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ),
    },
    {
      id: 'restrictions',
      title: 'Dietary Restrictions',
      subtitle: 'Any specific dietary requirements?',
      component: (
        <View style={styles.stepContent}>
          <Text style={styles.sectionTitle}>Select any that apply to you:</Text>
          <ScrollView style={styles.scrollableOptions} showsVerticalScrollIndicator={false}>
            <View style={styles.optionsGrid}>
              {dietaryRestrictions.map((restriction) => (
                <TouchableOpacity
                  key={restriction}
                  style={[
                    styles.optionButton,
                    profileData.dietaryRestrictions?.includes(restriction) && styles.optionButtonSelected,
                  ]}
                  onPress={() => toggleArrayItem('dietaryRestrictions', restriction)}
                >
                  <Text style={[
                    styles.optionText,
                    profileData.dietaryRestrictions?.includes(restriction) && styles.optionTextSelected,
                  ]}>
                    {restriction.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      ),
    },
    {
      id: 'allergies',
      title: 'Allergies & Intolerances',
      subtitle: 'Help us keep you safe',
      component: (
        <View style={styles.stepContent}>
          <Text style={styles.sectionTitle}>Do you have any food allergies?</Text>
          <View style={styles.optionsGrid}>
            {commonAllergies.map((allergy) => (
              <TouchableOpacity
                key={allergy}
                style={[
                  styles.optionButton,
                  profileData.allergies?.includes(allergy) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleArrayItem('allergies', allergy)}
              >
                <Text style={[
                  styles.optionText,
                  profileData.allergies?.includes(allergy) && styles.optionTextSelected,
                ]}>
                  {allergy}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ),
    },
    {
      id: 'cuisine',
      title: 'Cuisine Preferences',
      subtitle: 'What flavors do you love?',
      component: (
        <View style={styles.stepContent}>
          <Text style={styles.sectionTitle}>Select your favorite cuisines:</Text>
          <View style={styles.optionsGrid}>
            {cuisines.map((cuisine) => (
              <TouchableOpacity
                key={cuisine}
                style={[
                  styles.optionButton,
                  profileData.cuisinePreferences?.includes(cuisine) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleArrayItem('cuisinePreferences', cuisine)}
              >
                <Text style={[
                  styles.optionText,
                  profileData.cuisinePreferences?.includes(cuisine) && styles.optionTextSelected,
                ]}>
                  {cuisine}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ),
    },
    {
      id: 'cooking',
      title: 'Cooking Experience',
      subtitle: 'What\'s your skill level?',
      component: (
        <View style={styles.stepContent}>
          <Text style={styles.sectionTitle}>How would you rate your cooking skills?</Text>
          <View style={styles.skillLevels}>
            {skillLevels.map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.skillButton,
                  profileData.cookingSkillLevel === level && styles.skillButtonSelected,
                ]}
                onPress={() => updateProfileData('cookingSkillLevel', level)}
              >
                <Text style={[
                  styles.skillText,
                  profileData.cookingSkillLevel === level && styles.skillTextSelected,
                ]}>
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ),
    },
    {
      id: 'meals',
      title: 'Meal Preferences',
      subtitle: 'When do you like to cook?',
      component: (
        <View style={styles.stepContent}>
          <Text style={styles.sectionTitle}>Which meals do you typically prepare?</Text>
          <View style={styles.optionsGrid}>
            {mealTypes.map((meal) => (
              <TouchableOpacity
                key={meal}
                style={[
                  styles.optionButton,
                  profileData.preferredMealTypes?.includes(meal) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleArrayItem('preferredMealTypes', meal)}
              >
                <Text style={[
                  styles.optionText,
                  profileData.preferredMealTypes?.includes(meal) && styles.optionTextSelected,
                ]}>
                  {meal.charAt(0).toUpperCase() + meal.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ),
    },
    {
      id: 'health',
      title: 'Health Goals',
      subtitle: 'What are you working towards? (Optional)',
      component: (
        <View style={styles.stepContent}>
          <Text style={styles.sectionTitle}>Select your health goals:</Text>
          <View style={styles.optionsGrid}>
            {healthGoals.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.optionButton,
                  profileData.healthGoals?.includes(goal) && styles.optionButtonSelected,
                ]}
                onPress={() => toggleArrayItem('healthGoals', goal)}
              >
                <Text style={[
                  styles.optionText,
                  profileData.healthGoals?.includes(goal) && styles.optionTextSelected,
                ]}>
                  {goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ),
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete(profileData);
  };

  const isStepValid = () => {
    const step = steps[currentStep];
    switch (step.id) {
      case 'basic':
        return profileData.name && profileData.name.trim().length > 0;
      case 'dietary':
        return profileData.dietaryPreferences && profileData.dietaryPreferences.length > 0;
      case 'cooking':
        return profileData.cookingSkillLevel;
      case 'meals':
        return profileData.preferredMealTypes && profileData.preferredMealTypes.length > 0;
      default:
        return true; // Optional steps
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <X size={24} color={theme.colors.gray[600]} />
          </TouchableOpacity>
          
          <View style={styles.progressContainer}>
            <Text style={styles.stepCounter}>
              {currentStep + 1} of {steps.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${((currentStep + 1) / steps.length) * 100}%` }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.stepTitle}>{steps[currentStep].title}</Text>
          <Text style={styles.stepSubtitle}>{steps[currentStep].subtitle}</Text>
          
          {steps[currentStep].component}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.footerButton, currentStep === 0 && styles.footerButtonDisabled]}
            onPress={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft size={20} color={currentStep === 0 ? theme.colors.gray[400] : theme.colors.gray[600]} />
            <Text style={[
              styles.footerButtonText,
              currentStep === 0 && styles.footerButtonTextDisabled
            ]}>
              Previous
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.nextButton,
              !isStepValid() && styles.nextButtonDisabled
            ]}
            onPress={handleNext}
            disabled={!isStepValid()}
          >
            <Text style={[
              styles.nextButtonText,
              !isStepValid() && styles.nextButtonTextDisabled
            ]}>
              {currentStep === steps.length - 1 ? 'Complete' : 'Next'}
            </Text>
            {currentStep === steps.length - 1 ? (
              <Check size={20} color={isStepValid() ? 'white' : theme.colors.gray[400]} />
            ) : (
              <ChevronRight size={20} color={isStepValid() ? 'white' : theme.colors.gray[400]} />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  skipButton: {
    padding: theme.spacing.xs,
  },
  progressContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  stepCounter: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  stepTitle: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  stepSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xl,
    lineHeight: 22,
  },
  stepContent: {
    gap: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
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
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
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
  scrollableOptions: {
    maxHeight: 300,
  },
  skillLevels: {
    gap: theme.spacing.sm,
  },
  skillButton: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  skillButtonSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
  skillText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
  },
  skillTextSelected: {
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  footerButtonDisabled: {
    opacity: 0.5,
  },
  footerButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: theme.colors.gray[600],
  },
  footerButtonTextDisabled: {
    color: theme.colors.gray[400],
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  nextButtonDisabled: {
    backgroundColor: theme.colors.gray[300],
  },
  nextButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  nextButtonTextDisabled: {
    color: theme.colors.gray[400],
  },
});