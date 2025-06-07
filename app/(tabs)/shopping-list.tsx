import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { mockShoppingList } from '@/utils/mockData';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import ShoppingListItem from '@/components/shopping-list/ShoppingListItem';
import EmptyState from '@/components/common/EmptyState';
import { ShoppingListItem as ShoppingListItemType } from '@/types';
import { theme } from '@/constants/theme';
import { ShoppingBag, SquareCheck as CheckSquare, Trash2 } from 'lucide-react-native';

export default function ShoppingListScreen() {
  const router = useRouter();
  const [shoppingList, setShoppingList] = useState<ShoppingListItemType[]>(mockShoppingList);
  const [showChecked, setShowChecked] = useState(true);
  
  const filteredList = showChecked 
    ? shoppingList 
    : shoppingList.filter(item => !item.checked);
  
  const handleAddItem = () => {
    // Navigate to add item screen (would be implemented in a real app)
    console.log('Add item to shopping list');
  };
  
  const handleToggleItem = (itemId: string, checked: boolean) => {
    const updatedList = shoppingList.map(item => 
      item.id === itemId ? { ...item, checked } : item
    );
    setShoppingList(updatedList);
  };
  
  const handleDeleteItem = (itemId: string) => {
    const updatedList = shoppingList.filter(item => item.id !== itemId);
    setShoppingList(updatedList);
  };
  
  const handleClearChecked = () => {
    const updatedList = shoppingList.filter(item => !item.checked);
    setShoppingList(updatedList);
  };
  
  const renderItem = useCallback(({ item }: { item: ShoppingListItemType }) => (
    <ShoppingListItem
      item={item}
      onToggle={handleToggleItem}
      onDelete={handleDeleteItem}
    />
  ), []);
  
  const renderEmptyState = () => (
    <EmptyState
      title="Your shopping list is empty"
      message="Add items to your shopping list to make grocery shopping easier."
      actionLabel="Add Item"
      onAction={handleAddItem}
      icon={<ShoppingBag size={48} color={theme.colors.gray[400]} />}
    />
  );
  
  const checkedCount = shoppingList.filter(item => item.checked).length;

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      <Header title="Shopping List" showAdd onAddPress={handleAddItem} />
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.toggleCheckedButton}
          onPress={() => setShowChecked(!showChecked)}
        >
          <CheckSquare size={18} color={theme.colors.primary} />
          <Text style={styles.toggleCheckedText}>
            {showChecked ? 'Hide Checked' : 'Show Checked'}
          </Text>
        </TouchableOpacity>
        
        {checkedCount > 0 && (
          <TouchableOpacity
            style={styles.clearCheckedButton}
            onPress={handleClearChecked}
          >
            <Trash2 size={18} color={theme.colors.error} />
            <Text style={styles.clearCheckedText}>Clear Checked</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {filteredList.length > 0 ? (
        <FlatList
          data={filteredList}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {renderEmptyState()}
        </View>
      )}
      
      {shoppingList.length > 0 && (
        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            {checkedCount} of {shoppingList.length} items checked
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${(checkedCount / shoppingList.length) * 100}%` }
              ]} 
            />
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  toggleCheckedButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleCheckedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  clearCheckedButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearCheckedText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.error,
    marginLeft: theme.spacing.xs,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 80, // Extra space for the summary container
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
    ...theme.shadows.md,
  },
  summaryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
});