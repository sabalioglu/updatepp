import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Meal } from '@/types';
import { theme } from '@/constants/theme';
import { CreditCard as Edit, Trash2 } from 'lucide-react-native';

interface MealCardProps {
  meal: Meal;
  onPress: (meal: Meal) => void;
  onEdit: (meal: Meal) => void;
  onDelete: (mealId: string) => void;
}

export default function MealCard({ meal, onPress, onEdit, onDelete }: MealCardProps) {
  const getMealTypeColor = () => {
    switch (meal.type) {
      case 'breakfast':
        return theme.colors.success;
      case 'lunch':
        return theme.colors.primary;
      case 'dinner':
        return theme.colors.secondary;
      case 'snack':
        return theme.colors.accent;
      default:
        return theme.colors.gray[500];
    }
  };

  const getMealTypeLabel = () => {
    return meal.type.charAt(0).toUpperCase() + meal.type.slice(1);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(meal)}
      activeOpacity={0.7}
    >
      <View style={[styles.typeIndicator, { backgroundColor: getMealTypeColor() }]} />
      
      <View style={styles.contentContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.typeLabel}>{getMealTypeLabel()}</Text>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(meal)}
            >
              <Edit size={16} color={theme.colors.gray[600]} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onDelete(meal.id)}
            >
              <Trash2 size={16} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
        </View>
        
        <Text style={styles.mealName}>{meal.recipeName}</Text>
        
        {meal.notes && (
          <Text style={styles.notes}>{meal.notes}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  typeIndicator: {
    width: 8,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionButton: {
    padding: 2,
  },
  mealName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  notes: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[500],
    fontStyle: 'italic',
  },
});