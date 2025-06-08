import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useUserProfile } from '@/hooks/useUserProfile';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import { theme } from '@/constants/theme';
import { 
  User, 
  Shield, 
  Bell, 
  Smartphone, 
  HelpCircle, 
  LogOut, 
  ChevronRight,
  Trash2,
  Download,
  Upload
} from 'lucide-react-native';

export default function SettingsScreen() {
  const router = useRouter();
  const { resetProfile } = useUserProfile();

  const handleResetProfile = () => {
    Alert.alert(
      'Reset Profile',
      'Are you sure you want to reset your profile? This will delete all your preferences and data.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: async () => {
            await resetProfile();
            Alert.alert('Profile Reset', 'Your profile has been reset successfully.');
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert('Export Data', 'This feature will be available in a future update.');
  };

  const handleImportData = () => {
    Alert.alert('Import Data', 'This feature will be available in a future update.');
  };

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Email: support@pantrypal.com\nPhone: 1-800-PANTRY');
  };

  const settingSections = [
    {
      title: 'Account',
      items: [
        {
          icon: User,
          title: 'Personal Information',
          subtitle: 'Update your name and profile details',
          onPress: () => router.push('/profile/edit'),
        },
        {
          icon: Shield,
          title: 'Privacy Settings',
          subtitle: 'Manage your privacy preferences',
          onPress: () => Alert.alert('Privacy Settings', 'This feature will be available in a future update.'),
        },
      ],
    },
    {
      title: 'Preferences',
      items: [
        {
          icon: Bell,
          title: 'Notifications',
          subtitle: 'Manage notification preferences',
          onPress: () => Alert.alert('Notifications', 'This feature will be available in a future update.'),
        },
        {
          icon: Smartphone,
          title: 'App Preferences',
          subtitle: 'Customize your app experience',
          onPress: () => Alert.alert('App Preferences', 'This feature will be available in a future update.'),
        },
      ],
    },
    {
      title: 'Data',
      items: [
        {
          icon: Download,
          title: 'Export Data',
          subtitle: 'Download your data',
          onPress: handleExportData,
        },
        {
          icon: Upload,
          title: 'Import Data',
          subtitle: 'Import data from backup',
          onPress: handleImportData,
        },
        {
          icon: Trash2,
          title: 'Reset Profile',
          subtitle: 'Delete all data and start fresh',
          onPress: handleResetProfile,
          destructive: true,
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          icon: HelpCircle,
          title: 'Help & Support',
          subtitle: 'Get help and contact support',
          onPress: handleContactSupport,
        },
      ],
    },
  ];

  return (
    <ScreenContainer>
      <Header 
        title="Settings" 
        showBack 
        onBackPress={() => router.back()} 
      />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {settingSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  style={[
                    styles.settingItem,
                    itemIndex === section.items.length - 1 && styles.lastItem,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.settingLeft}>
                    <View style={[
                      styles.iconContainer,
                      item.destructive && styles.destructiveIconContainer,
                    ]}>
                      <item.icon 
                        size={20} 
                        color={item.destructive ? theme.colors.error : theme.colors.primary} 
                      />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={[
                        styles.settingTitle,
                        item.destructive && styles.destructiveText,
                      ]}>
                        {item.title}
                      </Text>
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={theme.colors.gray[400]} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Pantry Pal v1.0.0</Text>
          <Text style={styles.versionSubtext}>Made with ❤️ for better meal planning</Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  lastItem: {
    borderBottomWidth: 0,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginRight: theme.spacing.md,
  },
  destructiveIconContainer: {
    backgroundColor: theme.colors.expired,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 2,
  },
  destructiveText: {
    color: theme.colors.error,
  },
  settingSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  versionText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.xs,
  },
  versionSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
  },
});