import React, { useState, useCallback } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { usePantryItems } from '@/hooks/usePantryItems';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import PantryItem from '@/components/pantry/PantryItem';
import EmptyState from '@/components/common/EmptyState';
import { PantryItem as PantryItemType, FoodCategory } from '@/types';
import { theme } from '@/constants/theme';
import { ShoppingBag, Refrigerator } from 'lucide-react-native';

export default function PantryScreen() {
  const router = useRouter();
  const { items, loading, error, removeItem } = usePantryItems();
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');
  
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
    // Navigate to add item screen (would be implemented in a real app)
    console.log('Add item');
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
      title="Your pantry is empty"
      message="Add items to your pantry to keep track of what you have and get recipe suggestions."
      actionLabel="Add Item"
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
});