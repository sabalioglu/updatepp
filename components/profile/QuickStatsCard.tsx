import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { UserProfile } from '@/types';
import { theme } from '@/constants/theme';
import { Refrigerator, BookOpen, Target, TrendingUp } from 'lucide-react-native';

interface QuickStatsCardProps {
  profile: UserProfile | null;
  pantryItemsCount: number;
  recommendationsCount: number;
}

export default function QuickStatsCard({ 
  profile, 
  pantryItemsCount, 
  recommendationsCount 
}: QuickStatsCardProps) {
  if (!profile?.onboardingCompleted) {
    return null;
  }

  const getCompletionPercentage = () => {
    let completed = 0;
    let total = 8;

    if (profile.name) completed++;
    if (profile.dietaryPreferences.length > 0) completed++;
    if (profile.cuisinePreferences.length > 0) completed++;
    if (profile.cookingSkillLevel) completed++;
    if (profile.preferredMealTypes.length > 0) completed++;
    if (profile.healthGoals && profile.healthGoals.length > 0) completed++;
    if (profile.allergies.length > 0 || profile.intolerances.length > 0) completed++;
    if (profile.dislikedIngredients.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const stats = [
    {
      icon: Refrigerator,
      label: 'Pantry Items',
      value: pantryItemsCount.toString(),
      color: theme.colors.primary,
    },
    {
      icon: BookOpen,
      label: 'Recommendations',
      value: recommendationsCount.toString(),
      color: theme.colors.secondary,
    },
    {
      icon: Target,
      label: 'Profile Complete',
      value: `${getCompletionPercentage()}%`,
      color: theme.colors.success,
    },
    {
      icon: TrendingUp,
      label: 'Skill Level',
      value: profile.cookingSkillLevel.charAt(0).toUpperCase() + profile.cookingSkillLevel.slice(1),
      color: theme.colors.accent,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quick Stats</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View style={[styles.iconContainer, { backgroundColor: `${stat.color}20` }]}>
              <stat.icon size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: theme.spacing.sm,
  },
  iconContainer: {
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  statValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
});