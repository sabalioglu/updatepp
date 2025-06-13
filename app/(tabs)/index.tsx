import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/common/ScreenContainer';
import { User, Camera, Refrigerator, BookOpen, ShoppingBag } from 'lucide-react-native';

const theme = {
  colors: {
    primary: '#E67E22',
    secondary: '#7D9D9C',
    background: '#FFFFFF',
    text: '#333333',
    gray: {
      100: '#F5F5F5',
      600: '#757575',
    }
  },
  spacing: {
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    lg: 12,
  },
  shadows: {
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
    },
  }
};

export default function ProfileScreen() {
  const router = useRouter();

  const features = [
    {
      title: 'Smart Camera',
      description: 'Scan and analyze food items',
      icon: Camera,
      route: '/camera',
      color: theme.colors.primary,
    },
    {
      title: 'My Pantry',
      description: 'Manage your food inventory',
      icon: Refrigerator,
      route: '/pantry',
      color: theme.colors.secondary,
    },
    {
      title: 'Recipes',
      description: 'Discover new recipes',
      icon: BookOpen,
      route: '/recipes',
      color: '#5EAAA8',
    },
    {
      title: 'Shopping List',
      description: 'Plan your grocery trips',
      icon: ShoppingBag,
      route: '/shopping-list',
      color: '#4CAF50',
    },
  ];

  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <User size={32} color={theme.colors.gray[600]} />
          </View>
          <View>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.appName}>Pantry Pal</Text>
          </View>
        </View>
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.featureCard, { borderLeftColor: feature.color }]}
              onPress={() => router.push(feature.route as any)}
            >
              <feature.icon size={24} color={feature.color} />
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  welcomeText: {
    fontSize: 16,
    color: theme.colors.gray[600],
    fontFamily: 'Inter-Regular',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: 'Poppins-Bold',
  },
  featuresContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontFamily: 'Poppins-SemiBold',
  },
  featuresGrid: {
    gap: theme.spacing.md,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...theme.shadows.md,
  },
  featureContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
    fontFamily: 'Inter-SemiBold',
  },
  featureDescription: {
    fontSize: 14,
    color: theme.colors.gray[600],
    fontFamily: 'Inter-Regular',
  },
});