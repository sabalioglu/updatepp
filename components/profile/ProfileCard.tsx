import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { UserProfile } from '@/types';
import { theme } from '@/constants/theme';
import { Edit3, User, Settings } from 'lucide-react-native';

interface ProfileCardProps {
  profile: UserProfile | null;
  onEdit: () => void;
  onSetupProfile: () => void;
}

export default function ProfileCard({ profile, onEdit, onSetupProfile }: ProfileCardProps) {
  if (!profile?.onboardingCompleted) {
    return (
      <View style={styles.setupCard}>
        <View style={styles.setupIconContainer}>
          <User size={32} color={theme.colors.primary} />
        </View>
        <Text style={styles.setupTitle}>Complete Your Profile</Text>
        <Text style={styles.setupText}>
          Set up your dietary preferences and health goals to get personalized recipe recommendations.
        </Text>
        <TouchableOpacity style={styles.setupButton} onPress={onSetupProfile}>
          <Text style={styles.setupButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getDietaryBadges = () => {
    const badges = [
      ...profile.dietaryPreferences,
      ...profile.dietaryRestrictions.slice(0, 2), // Limit to avoid overflow
    ];
    return badges.slice(0, 3); // Show max 3 badges
  };

  const getHealthGoalText = () => {
    if (!profile.healthGoals || profile.healthGoals.length === 0) {
      return 'No specific health goals';
    }
    return profile.healthGoals.slice(0, 2).join(', ');
  };

  return (
    <View style={styles.profileCard}>
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <User size={24} color={theme.colors.gray[600]} />
            </View>
          )}
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>
            {profile.name || 'Pantry Pal User'}
          </Text>
          <Text style={styles.profileEmail}>
            {profile.email || 'No email provided'}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.editButton} onPress={onEdit}>
          <Edit3 size={18} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileDetails}>
        {/* Dietary Preferences */}
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Dietary Preferences</Text>
          <View style={styles.badgeContainer}>
            {getDietaryBadges().map((badge, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeText}>
                  {badge.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Text>
              </View>
            ))}
            {getDietaryBadges().length === 0 && (
              <Text style={styles.emptyText}>None specified</Text>
            )}
          </View>
        </View>

        {/* Cooking Level */}
        <View style={styles.detailSection}>
          <Text style={styles.detailLabel}>Cooking Level</Text>
          <Text style={styles.detailValue}>
            {profile.cookingSkillLevel.charAt(0).toUpperCase() + profile.cookingSkillLevel.slice(1)}
          </Text>
        </View>

        {/* Health Goals */}
        {profile.healthGoals && profile.healthGoals.length > 0 && (
          <View style={styles.detailSection}>
            <Text style={styles.detailLabel}>Health Goals</Text>
            <Text style={styles.detailValue}>{getHealthGoalText()}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  setupCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  setupIconContainer: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  setupTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  setupText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  setupButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
  },
  setupButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.gray[200],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: 2,
  },
  profileEmail: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  editButton: {
    padding: theme.spacing.sm,
  },
  profileDetails: {
    gap: theme.spacing.md,
  },
  detailSection: {
    gap: theme.spacing.xs,
  },
  detailLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.gray[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.text,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: 'white',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[500],
    fontStyle: 'italic',
  },
});