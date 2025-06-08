import React, { useState, useCallback } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity, Modal } from 'react-native';
import { usePantryItems } from '@/hooks/usePantryItems';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import PantryItem from '@/components/pantry/PantryItem';
import EmptyState from '@/components/common/EmptyState';
import { PantryItem as PantryItemType, FoodCategory } from '@/types';
import { theme } from '@/constants/theme';
import { ShoppingBag, Refrigerator, Camera, FileText, X } from 'lucide-react-native';

export default function PantryScreen() {
  const router = useRouter();
  const { items, loading, error, removeItem } = usePantryItems();
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const foodCategories: { label: string; value: FoodCategory | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Dairy', value: 'dairy' },
    { label: 'Meat', value: 'meat' },
    { label: 'Seafood', value: 'seafood' },
    { label: 'Fruits', value: 'fruits' },
    { label: 'Vegetables', value: 'vegetables' },
    { label: 'Grains', value: 'grains' },
    { label: 'Canned', value: 'canned' },
    { label: 'Frozen', value: 'frozen' },
    { label: 'Spices', value: 'spices' },
    { label: 'Condiments', value: 'condiments' },
  ];
  
  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);
  
  const handleAddItem = () => {
    setShowAddModal(true);
  };
  
  const handleAddViaCamera = () => {
    setShowAddModal(false);
    router.push('/camera');
  };
  
  const handleAddViaForm = () => {
    setShowAddModal(false);
    // Navigate to add item form (would be implemented in a real app)
    console.log('Add item via form');
  };
  
  const handleItemPress = (item: PantryItemType) => {
    // Navigate to item details (would be implemented in a real app)
    console.log('Item pressed:', item.name);
  };
  
  const handleEditItem = (item: PantryItemType) => {
    // Navigate to edit item screen (would be implemented in a real app)
    console.log('Edit item:', item.name);
  };
  
  const handleDeleteItem = (itemId: string) => {
    removeItem(itemId);
  };
  
  const renderItem = useCallback(({ item }: { item: PantryItemType }) => (
    <PantryItem
      item={item}
      onPress={handleItemPress}
      onEdit={handleEditItem}
      onDelete={handleDeleteItem}
    />
  ), []);
  
  const renderEmptyState = () => (
    <EmptyState
      title="Add inventory to get suggestions"
      message="Start by adding items to your pantry using the camera or manual entry to get personalized recipe recommendations."
      actionLabel="Add Items"
      onAction={handleAddItem}
      icon={<Refrigerator size={48} color={theme.colors.gray[400]} />}
    />
  );

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      <Header title="My Pantry" showAdd showSearch onAddPress={handleAddItem} />
      
      <View style={styles.categoryFilterContainer}>
        <FlatList
          data={foodCategories}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryButton,
                selectedCategory === item.value && styles.categoryButtonActive,
              ]}
              onPress={() => setSelectedCategory(item.value)}
            >
              <Text
                style={[
                  styles.categoryButtonText,
                  selectedCategory === item.value && styles.categoryButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.categoryList}
        />
      </View>
      
      {filteredItems.length > 0 ? (
        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {items.length > 0 ? (
            <EmptyState
              title="No items found"
              message={`You don't have any items in the ${selectedCategory} category.`}
              actionLabel="Add Item"
              onAction={handleAddItem}
              icon={<Refrigerator size={48} color={theme.colors.gray[400]} />}
            />
          ) : (
            renderEmptyState()
          )}
        </View>
      )}
      
      <TouchableOpacity
        style={styles.shoppingListButton}
        onPress={() => router.push('/shopping-list')}
      >
        <ShoppingBag size={20} color="white" />
        <Text style={styles.shoppingListButtonText}>Shopping List</Text>
      </TouchableOpacity>

      {/* Add Item Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Inventory</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <X size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalDescription}>
              Choose how you'd like to add items to your pantry
            </Text>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleAddViaCamera}>
              <Camera size={24} color={theme.colors.primary} />
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Use Camera</Text>
                <Text style={styles.modalOptionSubtitle}>
                  Take a photo to automatically identify and add items
                </Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalOption} onPress={handleAddViaForm}>
              <FileText size={24} color={theme.colors.secondary} />
              <View style={styles.modalOptionText}>
                <Text style={styles.modalOptionTitle}>Manual Entry</Text>
                <Text style={styles.modalOptionSubtitle}>
                  Add items manually using a form
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  categoryFilterContainer: {
    marginBottom: theme.spacing.sm,
  },
  categoryList: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  categoryButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.sm,
    backgroundColor: theme.colors.gray[200],
  },
  categoryButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[700],
  },
  categoryButtonTextActive: {
    color: 'white',
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 80, // Extra padding for the floating button
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shoppingListButton: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    right: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.md,
  },
  shoppingListButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
    marginLeft: theme.spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  modalTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: theme.colors.text,
  },
  modalDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginBottom: theme.spacing.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.gray[100],
    marginBottom: theme.spacing.md,
  },
  modalOptionText: {
    marginLeft: theme.spacing.md,
    flex: 1,
  },
  modalOptionTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 2,
  },
  modalOptionSubtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
});