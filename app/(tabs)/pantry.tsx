import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePantryItems } from '../../hooks/usePantryItems';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../constants/theme';
import PantryItemCard from '../../components/pantry/PantryItemCard';
import AddItemModal from '../../components/pantry/AddItemModal';
import AuthScreen from '../../components/auth/AuthScreen';
import { Refrigerator, Plus, Search, Filter, AlertTriangle, CheckCircle } from 'lucide-react-native';
import type { Database } from '../../types/database';

type PantryItem = Database['public']['Tables']['pantry_items']['Row'];

export default function PantryScreen() {
  const { user, loading: authLoading } = useAuth();
  const { items, loading, error, addItem, deleteItem, getExpiringItems, getExpiredItems } = usePantryItems();
  const [showAddModal, setShowAddModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh logic would go here
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleAddItem = async (itemData: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiry_date?: string;
    notes?: string;
  }) => {
    await addItem(itemData);
  };

  const handleEditItem = (item: PantryItem) => {
    // TODO: Implement edit functionality
    Alert.alert('Edit Item', 'Edit functionality coming soon!');
  };

  const handleDeleteItem = (item: PantryItem) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteItem(item.id)
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Refrigerator size={48} color={theme.colors.gray[400]} />
          <Text style={styles.loadingText}>Loading your pantry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>My Pantry</Text>
          <Text style={styles.subtitle}>{items.length} items</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Status Cards */}
      {(expiredItems.length > 0 || expiringItems.length > 0) && (
        <View style={styles.statusContainer}>
          {expiredItems.length > 0 && (
            <View style={[styles.statusCard, styles.expiredCard]}>
              <AlertTriangle size={20} color={theme.colors.error} />
              <Text style={styles.statusText}>
                {expiredItems.length} expired item{expiredItems.length !== 1 ? 's' : ''}
              </Text>
            </View>
          )}
          {expiringItems.length > 0 && (
            <View style={[styles.statusCard, styles.expiringCard]}>
              <AlertTriangle size={20} color="#B8860B" />
              <Text style={styles.statusText}>
                {expiringItems.length} expiring soon
              </Text>
            </View>
          )}
        </View>
      )}

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Refrigerator size={64} color={theme.colors.gray[400]} />
          <Text style={styles.emptyTitle}>Your pantry is empty</Text>
          <Text style={styles.emptyText}>
            Start by adding items using the + button to get personalized recipe recommendations.
          </Text>
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={20} color="white" />
            <Text style={styles.emptyAddButtonText}>Add Your First Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.itemsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {items.map((item) => (
            <PantryItemCard
              key={item.id}
              item={item}
              onEdit={handleEditItem}
              onDelete={handleDeleteItem}
            />
          ))}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}

      <AddItemModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.md,
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
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.sm,
    ...theme.shadows.md,
  },
  errorContainer: {
    backgroundColor: theme.colors.expired,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    textAlign: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  statusCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.xs,
  },
  expiredCard: {
    backgroundColor: theme.colors.expired,
  },
  expiringCard: {
    backgroundColor: theme.colors.expiring,
  },
  statusText: {
    ...theme.typography.captionMedium,
    color: theme.colors.text,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyAddButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  emptyAddButtonText: {
    ...theme.typography.bodySemiBold,
    color: 'white',
  },
  itemsList: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  bottomPadding: {
    height: theme.spacing.xl,
  },
});