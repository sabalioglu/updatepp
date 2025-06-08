import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { getMealPlans, saveMealPlan, deleteMealPlan } from '@/utils/storage';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import MealCard from '@/components/meal-plan/MealCard';
import EmptyState from '@/components/common/EmptyState';
import { MealPlan, Meal } from '@/types';
import { theme } from '@/constants/theme';
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';

export default function MealPlanScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Generate dates for the week view
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i - 3));
  
  // Get meals for selected date
  const selectedMealPlan = mealPlans.find(plan => 
    isSameDay(new Date(plan.date), selectedDate)
  );

  useEffect(() => {
    loadMealPlans();
  }, []);

  const loadMealPlans = async () => {
    try {
      setLoading(true);
      const plans = await getMealPlans();
      setMealPlans(plans);
    } catch (error) {
      console.error('Error loading meal plans:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddMeal = () => {
    Alert.alert(
      'Add Meal',
      'Choose how you want to add a meal:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Quick Add', 
          onPress: () => addQuickMeal()
        },
        { 
          text: 'From Recipe', 
          onPress: () => Alert.alert('Coming Soon', 'Recipe selection will be available in a future update.')
        }
      ]
    );
  };

  const addQuickMeal = () => {
    Alert.prompt(
      'Add Quick Meal',
      'Enter meal name:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add',
          onPress: (mealName) => {
            if (mealName && mealName.trim()) {
              createMeal(mealName.trim());
            }
          }
        }
      ],
      'plain-text',
      '',
      'default'
    );
  };

  const createMeal = async (mealName: string) => {
    try {
      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
      const currentHour = new Date().getHours();
      
      let defaultMealType: typeof mealTypes[number] = 'lunch';
      if (currentHour < 11) defaultMealType = 'breakfast';
      else if (currentHour < 16) defaultMealType = 'lunch';
      else if (currentHour < 21) defaultMealType = 'dinner';
      else defaultMealType = 'snack';

      const newMeal: Meal = {
        id: Date.now().toString(),
        type: defaultMealType,
        recipeId: null,
        recipeName: mealName,
        notes: '',
      };

      const dateString = format(selectedDate, 'yyyy-MM-dd');
      let planToUpdate = mealPlans.find(plan => plan.date === dateString);

      if (!planToUpdate) {
        planToUpdate = {
          id: Date.now().toString(),
          date: dateString,
          meals: [newMeal],
        };
        await saveMealPlan(planToUpdate);
        setMealPlans(prev => [...prev, planToUpdate!]);
      } else {
        const updatedPlan = {
          ...planToUpdate,
          meals: [...planToUpdate.meals, newMeal],
        };
        await saveMealPlan(updatedPlan);
        setMealPlans(prev => prev.map(plan => 
          plan.id === updatedPlan.id ? updatedPlan : plan
        ));
      }

      Alert.alert('Success', `Added "${mealName}" to your meal plan!`);
    } catch (error) {
      console.error('Error creating meal:', error);
      Alert.alert('Error', 'Failed to add meal. Please try again.');
    }
  };
  
  const handleMealPress = (meal: Meal) => {
    Alert.alert(
      meal.recipeName,
      `Meal Type: ${meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}${meal.notes ? `\nNotes: ${meal.notes}` : ''}`,
      [
        { text: 'OK' }
      ]
    );
  };
  
  const handleEditMeal = (meal: Meal) => {
    Alert.prompt(
      'Edit Meal',
      'Update meal name:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update',
          onPress: (newName) => {
            if (newName && newName.trim()) {
              updateMeal(meal.id, { ...meal, recipeName: newName.trim() });
            }
          }
        }
      ],
      'plain-text',
      meal.recipeName,
      'default'
    );
  };

  const updateMeal = async (mealId: string, updatedMeal: Meal) => {
    try {
      if (selectedMealPlan) {
        const updatedMeals = selectedMealPlan.meals.map(meal => 
          meal.id === mealId ? updatedMeal : meal
        );
        const updatedPlan = { ...selectedMealPlan, meals: updatedMeals };
        
        await saveMealPlan(updatedPlan);
        setMealPlans(prev => prev.map(plan => 
          plan.id === updatedPlan.id ? updatedPlan : plan
        ));
      }
    } catch (error) {
      console.error('Error updating meal:', error);
      Alert.alert('Error', 'Failed to update meal. Please try again.');
    }
  };
  
  const handleDeleteMeal = (mealId: string) => {
    Alert.alert(
      'Delete Meal',
      'Are you sure you want to delete this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => deleteMeal(mealId)
        }
      ]
    );
  };

  const deleteMeal = async (mealId: string) => {
    try {
      if (selectedMealPlan) {
        const updatedMeals = selectedMealPlan.meals.filter(meal => meal.id !== mealId);
        const updatedPlan = { ...selectedMealPlan, meals: updatedMeals };
        
        await saveMealPlan(updatedPlan);
        setMealPlans(prev => prev.map(plan => 
          plan.id === updatedPlan.id ? updatedPlan : plan
        ));
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      Alert.alert('Error', 'Failed to delete meal. Please try again.');
    }
  };
  
  const goToPrevDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, -1));
  };
  
  const goToNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };
  
  const renderMealItem = useCallback(({ item }: { item: Meal }) => (
    <MealCard
      meal={item}
      onPress={handleMealPress}
      onEdit={handleEditMeal}
      onDelete={handleDeleteMeal}
    />
  ), []);
  
  const renderEmptyState = () => (
    <EmptyState
      title="No meals planned"
      message="Plan your meals for this day to help reduce food waste and make grocery shopping easier."
      actionLabel="Add Meal"
      onAction={handleAddMeal}
      icon={<Calendar size={48} color={theme.colors.gray[400]} />}
    />
  );

  if (loading) {
    return (
      <ScreenContainer>
        <Header title="Meal Plan\" showBack onBackPress={() => router.back()} />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading meal plans...</Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      <Header title="Meal Plan" showBack onBackPress={() => router.back()} showAdd onAddPress={handleAddMeal} />
      
      <View style={styles.calendarContainer}>
        <TouchableOpacity style={styles.arrowButton} onPress={goToPrevDay}>
          <ChevronLeft size={24} color={theme.colors.gray[600]} />
        </TouchableOpacity>
        <View style={styles.datesContainer}>
          {weekDates.map((date, index) => {
            const isSelected = isSameDay(date, selectedDate);
            const isToday = isSameDay(date, new Date());
            
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dateButton,
                  isSelected && styles.selectedDateButton,
                  isToday && styles.todayDateButton,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[
                  styles.dayOfWeek,
                  isSelected && styles.selectedDayOfWeek,
                ]}>
                  {format(date, 'EEE')}
                </Text>
                <Text style={[
                  styles.dayOfMonth,
                  isSelected && styles.selectedDayOfMonth,
                ]}>
                  {format(date, 'd')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={styles.arrowButton} onPress={goToNextDay}>
          <ChevronRight size={24} color={theme.colors.gray[600]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.dateHeaderContainer}>
        <Text style={styles.dateHeader}>
          {format(selectedDate, 'MMMM d, yyyy')}
        </Text>
        <Text style={styles.mealCount}>
          {selectedMealPlan?.meals.length || 0} meal{(selectedMealPlan?.meals.length || 0) !== 1 ? 's' : ''} planned
        </Text>
      </View>
      
      {selectedMealPlan && selectedMealPlan.meals.length > 0 ? (
        <FlatList
          data={selectedMealPlan.meals}
          renderItem={renderMealItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {renderEmptyState()}
        </View>
      )}

      {/* Quick Add Button */}
      <TouchableOpacity style={styles.quickAddButton} onPress={handleAddMeal}>
        <Plus size={24} color="white" />
        <Text style={styles.quickAddText}>Quick Add</Text>
      </TouchableOpacity>
    </ScreenContainer>
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
  },
  loadingText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[600],
  },
  calendarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  arrowButton: {
    padding: theme.spacing.sm,
  },
  datesContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  dateButton: {
    alignItems: 'center',
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    width: 40,
  },
  selectedDateButton: {
    backgroundColor: theme.colors.primary,
  },
  todayDateButton: {
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  dayOfWeek: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[600],
    marginBottom: 2,
  },
  selectedDayOfWeek: {
    color: 'white',
  },
  dayOfMonth: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
  },
  selectedDayOfMonth: {
    color: 'white',
  },
  dateHeaderContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  dateHeader: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
  },
  mealCount: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginTop: 2,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 100, // Extra space for floating button
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickAddButton: {
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
  quickAddText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
    marginLeft: theme.spacing.xs,
  },
});