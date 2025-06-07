import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { format, addDays, startOfDay, isSameDay } from 'date-fns';
import { getMealPlans, saveMealPlan, deleteMealPlan } from '@/utils/storage';
import { mockMealPlans } from '@/utils/mockData';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import MealCard from '@/components/meal-plan/MealCard';
import EmptyState from '@/components/common/EmptyState';
import { MealPlan, Meal } from '@/types';
import { theme } from '@/constants/theme';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function MealPlanScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [mealPlans, setMealPlans] = useState<MealPlan[]>(mockMealPlans);
  
  // Generate dates for the week view
  const weekDates = Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i - 3));
  
  // Get meals for selected date
  const selectedMealPlan = mealPlans.find(plan => 
    isSameDay(new Date(plan.date), selectedDate)
  );
  
  const handleAddMeal = () => {
    // Navigate to add meal screen (would be implemented in a real app)
    console.log('Add meal');
  };
  
  const handleMealPress = (meal: Meal) => {
    // Navigate to meal details (would be implemented in a real app)
    console.log('Meal pressed:', meal.recipeName);
  };
  
  const handleEditMeal = (meal: Meal) => {
    // Navigate to edit meal screen (would be implemented in a real app)
    console.log('Edit meal:', meal.recipeName);
  };
  
  const handleDeleteMeal = (mealId: string) => {
    if (selectedMealPlan) {
      const updatedMeals = selectedMealPlan.meals.filter(meal => meal.id !== mealId);
      const updatedPlan = { ...selectedMealPlan, meals: updatedMeals };
      
      // Update the meal plans
      const updatedPlans = mealPlans.map(plan => 
        plan.id === updatedPlan.id ? updatedPlan : plan
      );
      
      setMealPlans(updatedPlans);
      // In a real app, would also update storage
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

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      <Header title="Meal Plan" showAdd onAddPress={handleAddMeal} />
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  listContent: {
    padding: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});