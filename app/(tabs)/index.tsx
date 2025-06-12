import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useRecipeRecommendations } from '@/hooks/useRecipeRecommendations';
import { usePantryItems } from '@/hooks/usePantryItems';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import ProfileCard from '@/components/profile/ProfileCard';
import RecommendationCard from '@/components/profile/RecommendationCard';
import QuickStatsCard from '@/components/profile/QuickStatsCard';
import OnboardingModal from '@/components/profile/OnboardingModal';
import { theme } from '@/constants/theme';
import { Settings, TrendingUp, Heart, Clock, ChefHat, Calendar, ShoppingBag, Utensils, TestTube } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, loading: profileLoading, updateProfile } = useUserProfile();
  const { items } = usePantryItems();
  const { recommendations, loading: recommendationsLoading, refreshRecommendations } = useRecipeRecommendations();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (profile && !profile.onboardingCompleted) {
      setShowOnboarding(true);
    }
  }, [profile]);

  useEffect(() => {
    if (profile?.onboardingCompleted) {
      refreshRecommendations();
    }
  }, [profile?.onboardingCompleted, refreshRecommendations]);

  const handleCompleteOnboarding = async (updatedProfile: any) => {
    await updateProfile({
      ...updatedProfile,
      onboardingCompleted: true,
      updatedAt: new Date().toISOString(),
    });
    setShowOnboarding(false);
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleViewRecommendation = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getPersonalizedMessage = () => {
    if (!profile?.onboardingCompleted) {
      return "Let's set up your profile to get personalized recipe recommendations!";
    }

    const messages = [
      "Here are some recipes tailored just for you!",
      "Based on your preferences, we found these perfect matches.",
      "Your personalized cooking journey continues!",
      "Discover new flavors that match your taste!",
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  };

  if (profileLoading) {
    return (
      <ScreenContainer>
        <Header title="Profile" />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading your profile...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header 
        title="Pantry Pal" 
        showAdd={false}
        showSearch={false}
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          <Text style={styles.greetingText}>
            {getGreeting()}{profile?.name ? `, ${profile.name}` : ''}!
          </Text>
          <Text style={styles.messageText}>{getPersonalizedMessage()}</Text>
        </View>

        {/* Profile Card */}
        <ProfileCard 
          profile={profile}
          onEdit={handleEditProfile}
          onSetupProfile={() => setShowOnboarding(true)}
        />

        {/* Quick Stats */}
        <QuickStatsCard 
          profile={profile}
          pantryItemsCount={items.length}
          recommendationsCount={recommendations.length}
        />

        {/* Profile Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Features</Text>
          <View style={styles.featuresGrid}>
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => router.push('/profile/meal-plan')}
            >
              <Calendar size={24} color={theme.colors.primary} />
              <Text style={styles.featureTitle}>Meal Planning</Text>
              <Text style={styles.featureDescription}>Plan your weekly meals</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => router.push('/profile/saved-recipes')}
            >
              <Heart size={24} color={theme.colors.error} />
              <Text style={styles.featureTitle}>Saved Recipes</Text>
              <Text style={styles.featureDescription}>Your favorite recipes</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => router.push('/profile/dietary-preferences')}
            >
              <Utensils size={24} color={theme.colors.secondary} />
              <Text style={styles.featureTitle}>Dietary Preferences</Text>
              <Text style={styles.featureDescription}>Manage your diet settings</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.featureCard}
              onPress={() => router.push('/profile/settings')}
            >
              <Settings size={24} color={theme.colors.gray[600]} />
              <Text style={styles.featureTitle}>Settings</Text>
              <Text style={styles.featureDescription}>App preferences</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Developer Testing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Developer Testing</Text>
          <View style={styles.featuresGrid}>
            <TouchableOpacity 
              style={[styles.featureCard, styles.testCard]}
              onPress={() => router.push('/(test-screens)/BarcodeTest')}
            >
              <TestTube size={24} color={theme.colors.warning} />
              <Text style={styles.featureTitle}>Barcode Test</Text>
              <Text style={styles.featureDescription}>Test barcode scanner functionality</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Personalized Recommendations */}
        {profile?.onboardingCompleted && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <TrendingUp size={20} color={theme.colors.primary} />
                <Text style={styles.sectionTitle}>Recommended for You</Text>
              </View>
              <TouchableOpacity onPress={() => router.push('/recipes')}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            {recommendationsLoading ? (
              <View style={styles.loadingRecommendations}>
                <Text style={styles.loadingText}>Finding perfect recipes for you...</Text>
              </View>
            ) : recommendations.length > 0 ? (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendationsScroll}
              >
                {recommendations.slice(0, 5).map((recommendation) => (
                  <RecommendationCard
                    key={recommendation.recipe.id}
                    recommendation={recommendation}
                    onPress={() => handleViewRecommendation(recommendation.recipe.id)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyRecommendations}>
                <ChefHat size={48} color={theme.colors.gray[400]} />
                <Text style={styles.emptyTitle}>No recommendations yet</Text>
                <Text style={styles.emptyText}>
                  Add more items to your pantry or update your preferences to get personalized recommendations.
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => router.push('/pantry')}
                >
                  <Text style={styles.emptyButtonText}>Go to Pantry</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Health Insights */}
        {profile?.onboardingCompleted && profile.healthGoals && profile.healthGoals.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Heart size={20} color={theme.colors.error} />
                <Text style={styles.sectionTitle}>Health Insights</Text>
              </View>
            </View>
            
            <View style={styles.healthInsights}>
              <Text style={styles.insightText}>
                Based on your {profile.healthGoals.join(', ')} goals, we're focusing on recipes that support your journey.
              </Text>
              
              {profile.dailyCaloricNeeds && (
                <View style={styles.calorieInfo}>
                  <Text style={styles.calorieLabel}>Daily Caloric Target:</Text>
                  <Text style={styles.calorieValue}>{profile.dailyCaloricNeeds} calories</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/shopping-list')}
          >
            <ShoppingBag size={24} color="white" />
            <Text style={styles.actionText}>Shopping List</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
            onPress={() => router.push('/camera')}
          >
            <Calendar size={24} color="white" />
            <Text style={styles.actionText}>Calorie Counter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Onboarding Modal */}
      <OnboardingModal
        visible={showOnboarding}
        onComplete={handleCompleteOnboarding}
        onSkip={() => setShowOnboarding(false)}
        initialProfile={profile}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[600],
  },
  greetingSection: {
    marginBottom: theme.spacing.lg,
  },
  greetingText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  messageText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[600],
    lineHeight: 22,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
  },
  seeAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.primary,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    width: '47%',
    ...theme.shadows.sm,
  },
  testCard: {
    backgroundColor: theme.colors.expirySoon,
    borderWidth: 2,
    borderColor: theme.colors.warning,
  },
  featureTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginTop: 2,
  },
  loadingRecommendations: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  recommendationsScroll: {
    paddingRight: theme.spacing.md,
  },
  emptyRecommendations: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  emptyButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
  },
  healthInsights: {
    backgroundColor: theme.colors.fresh,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  insightText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  calorieInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calorieLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[700],
  },
  calorieValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.success,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  actionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    ...theme.shadows.md,
  },
  actionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: 'white',
    marginTop: theme.spacing.xs,
  },
});