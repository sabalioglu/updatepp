import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { ShoppingListItem as ShoppingListItemType } from '@/types';
import { theme } from '@/constants/theme';
import { CircleCheck as CheckCircle2, Circle, Trash2 } from 'lucide-react-native';

interface ShoppingListItemProps {
  item: ShoppingListItemType;
  onToggle: (itemId: string, checked: boolean) => void;
  onDelete: (itemId: string) => void;
}

export default function ShoppingListItem({ 
  item, 
  onToggle, 
  onDelete 
}: ShoppingListItemProps) {
  const getSourceLabel = () => {
    switch (item.source) {
      case 'recipe':
        return 'From recipe';
      case 'low-stock':
        return 'Low stock';
      case 'manual':
        return 'Added manually';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkContainer}
        onPress={() => onToggle(item.id, !item.checked)}
      >
        {item.checked ? (
          <CheckCircle2 size={24} color={theme.colors.primary} />
        ) : (
          <Circle size={24} color={theme.colors.gray[400]} />
        )}
      </TouchableOpacity>
      
      <View style={styles.contentContainer}>
        <Text 
          style={[
            styles.itemName,
            item.checked && styles.checkedText
          ]}
        >
          {item.name}
        </Text>
        
        <View style={styles.detailsContainer}>
          <Text style={styles.quantity}>
            {item.quantity} {item.unit}
          </Text>
          <Text style={styles.sourceLabel}>{getSourceLabel()}</Text>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => onDelete(item.id)}
      >
        <Trash2 size={20} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  checkContainer: {
    marginRight: theme.spacing.md,
  },
  contentContainer: {
    flex: 1,
  },
  itemName: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  checkedText: {
    textDecorationLine: 'line-through',
    color: theme.colors.gray[400],
  },
  detailsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginRight: theme.spacing.md,
  },
  sourceLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[500],
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
});