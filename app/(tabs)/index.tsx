import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../hooks/useAuth';
import { usePantryItems } from '../../hooks/usePantryItems';
import { theme } from '../../constants/theme';
import AuthScreen from '../../components/auth/AuthScreen';
import { User, Camera, Refrigerator, BookOpen, ShoppingBag, Plus, AlertTriangle, TrendingUp, Clock } from 'lucide-react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, loading: authLoading, signOut } = useAuth();
  const { items, getExpiringItems, getExpiredItems } = usePantryItems();

  if (authLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  const expiringItems = getExpiringItems();
  const expiredItems = getExpiredItems();

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
      description: `${items.length} items stored`,
      icon: Refrigerator,
      route: '/pantry',
      color: theme.colors.secondary,
    },
    {
      title: 'Recipes',
      description: 'Discover new recipes',
      icon: BookOpen,
      route: '/recipes',
      color: theme.colors.accent,
    },
    {
      title: 'Shopping List',
      description: 'Plan your grocery trips',
      icon: ShoppingBag,
      route: '/shopping-list',
      color: theme.colors.success,
    },
  ];

  const quickStats = [
    {
      title: 'Total Items',
      value: items.length.toString(),
      icon: Refrigerator,
      color: theme.colors.primary,
    },
    {
      title: 'Expiring Soon',
      value: expiringItems.length.toString(),
      icon: Clock,
      color: theme.colors.warning,
    },
    {
      title: 'Expired',
      value: expiredItems.length.toString(),
      icon: AlertTriangle,
      color: theme.colors.error,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <User size={32} color={theme.colors.gray[600]} />
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back</Text>
              <Text style={styles.userName}>{user.email}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <Image
            source={{ uri: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>Pantry Pal</Text>
            <Text style={styles.heroSubtitle}>Smart food management made simple</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Quick Overview</Text>
          <View style={styles.statsGrid}>
            {quickStats.map((stat, index) => (
              <View key={index} style={[styles.statCard, { borderLeftColor: stat.color }]}>
                <stat.icon size={24} color={stat.color} />
                <View style={styles.statContent}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statTitle}>{stat.title}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Alerts */}
        {(expiredItems.length > 0 || expiringItems.length > 0) && (
          <View style={styles.alertsSection}>
            <Text style={styles.sectionTitle}>Attention Needed</Text>
            {expiredItems.length > 0 && (
              <TouchableOpacity 
                style={[styles.alertCard, styles.expiredAlert]}
                onPress={() => router.push('/pantry')}
              >
                <AlertTriangle size={20} color={theme.colors.error} />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Items Expired</Text>
                  <Text style={styles.alertText}>
                    {expiredItems.length} item{expiredItems.length !== 1 ? 's' : ''} need{expiredItems.length === 1 ? 's' : ''} attention
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            {expiringItems.length > 0 && (
              <TouchableOpacity 
                style={[styles.alertCard, styles.expiringAlert]}
                onPress={() => router.push('/pantry')}
              >
                <Clock size={20} color="#B8860B" />
                <View style={styles.alertContent}>
                  <Text style={styles.alertTitle}>Expiring Soon</Text>
                  <Text style={styles.alertText}>
                    {expiringItems.length} item{expiringItems.length !== 1 ? 's' : ''} expiring within 7 days
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Features */}
        <View style={styles.featuresSection}>
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

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/camera')}
            >
              <Camera size={32} color={theme.colors.primary} />
              <Text style={styles.quickActionText}>Scan Food</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => router.push('/pantry')}
            >
              <Plus size={32} color={theme.colors.secondary} />
              <Text style={styles.quickActionText}>Add Item</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    ...theme.shadows.sm,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  userName: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.text,
  },
  signOutButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  signOutText: {
    ...theme.typography.captionMedium,
    color: theme.colors.error,
  },
  heroSection: {
    position: 'relative',
    height: 200,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: theme.spacing.lg,
  },
  heroTitle: {
    ...theme.typography.h2,
    color: 'white',
    marginBottom: theme.spacing.xs,
  },
  heroSubtitle: {
    ...theme.typography.body,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    gap: theme.spacing.sm,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    ...theme.shadows.sm,
  },
  statContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  statValue: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  statTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  alertsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  expiredAlert: {
    backgroundColor: theme.colors.expired,
  },
  expiringAlert: {
    backgroundColor: theme.colors.expiring,
  },
  alertContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  alertTitle: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.text,
  },
  alertText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  featuresSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
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
    ...theme.shadows.sm,
  },
  featureContent: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  featureTitle: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  featureDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
  },
  quickActionsSection: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  quickActionText: {
    ...theme.typography.captionMedium,
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  bottomPadding: {
    height: theme.spacing.xl,
  },
});