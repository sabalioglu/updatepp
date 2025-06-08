import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Meal } from '@/types';
import { theme } from '@/constants/theme';
import { CreditCard as Edit3, Trash2, Clock } from 'lucide-react-native';

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

  const getMealTypeIcon = () => {
    switch (meal.type) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
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
          <View style={styles.mealTypeContainer}>
            <Text style={styles.mealTypeIcon}>{getMealTypeIcon()}</Text>
            <Text style={styles.typeLabel}>{getMealTypeLabel()}</Text>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEdit(meal)}
            >
              <Edit3 size={16} color={theme.colors.gray[600]} />
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

        {meal.recipeId && (
          <View style={styles.recipeIndicator}>
            <Clock size={12} color={theme.colors.primary} />
            <Text style={styles.recipeText}>From saved recipe</Text>
          </View>
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
    width: 6,
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
    marginBottom: theme.spacing.xs,
  },
  mealTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealTypeIcon: {
    fontSize: 16,
    marginRight: theme.spacing.xs,
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
    padding: 4,
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
    marginBottom: theme.spacing.xs,
  },
  recipeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  recipeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.primary,
    marginLeft: 4,
  },
});