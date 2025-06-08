import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { theme } from '@/constants/theme';
import { X, Zap, TrendingUp, Target, Info } from 'lucide-react-native';

interface FoodItem {
  name: string;
  quantity: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface CalorieAnalysisResult {
  identifiedFoods: FoodItem[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  mealType: string;
  healthScore: number;
  nutritionalTips: string[];
}

interface CalorieCounterModalProps {
  visible: boolean;
  onClose: () => void;
  analysisResult: CalorieAnalysisResult | null;
  loading: boolean;
  error: string | null;
}

export default function CalorieCounterModal({
  visible,
  onClose,
  analysisResult,
  loading,
  error,
}: CalorieCounterModalProps) {
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.error;
  };

  const getMacroPercentage = (macro: number, totalCalories: number) => {
    if (totalCalories === 0) return 0;
    const caloriesFromMacro = macro * (macro === analysisResult?.totalFat ? 9 : 4); // Fat has 9 cal/g, others 4 cal/g
    return Math.round((caloriesFromMacro / totalCalories) * 100);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calorie Counter</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={styles.loadingContainer}>
              <Zap size={48} color={theme.colors.primary} />
              <Text style={styles.loadingText}>Analyzing your meal...</Text>
              <Text style={styles.loadingSubtext}>Calculating calories and nutrients</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Analysis Failed</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {analysisResult && !loading && !error && (
            <>
              {/* Total Calories Summary */}
              <View style={styles.summaryCard}>
                <View style={styles.calorieDisplay}>
                  <Text style={styles.calorieNumber}>{analysisResult.totalCalories}</Text>
                  <Text style={styles.calorieLabel}>calories</Text>
                </View>
                
                <View style={styles.mealTypeContainer}>
                  <Text style={styles.mealType}>{analysisResult.mealType}</Text>
                  <View style={styles.healthScoreContainer}>
                    <Text style={styles.healthScoreLabel}>Health Score</Text>
                    <Text style={[
                      styles.healthScore, 
                      { color: getHealthScoreColor(analysisResult.healthScore) }
                    ]}>
                      {analysisResult.healthScore}/100
                    </Text>
                  </View>
                </View>
              </View>

              {/* Macronutrients Breakdown */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Macronutrients</Text>
                <View style={styles.macroGrid}>
                  <View style={styles.macroCard}>
                    <Text style={styles.macroValue}>{analysisResult.totalProtein}g</Text>
                    <Text style={styles.macroLabel}>Protein</Text>
                    <Text style={styles.macroPercentage}>
                      {getMacroPercentage(analysisResult.totalProtein, analysisResult.totalCalories)}%
                    </Text>
                  </View>
                  
                  <View style={styles.macroCard}>
                    <Text style={styles.macroValue}>{analysisResult.totalCarbs}g</Text>
                    <Text style={styles.macroLabel}>Carbs</Text>
                    <Text style={styles.macroPercentage}>
                      {getMacroPercentage(analysisResult.totalCarbs, analysisResult.totalCalories)}%
                    </Text>
                  </View>
                  
                  <View style={styles.macroCard}>
                    <Text style={styles.macroValue}>{analysisResult.totalFat}g</Text>
                    <Text style={styles.macroLabel}>Fat</Text>
                    <Text style={styles.macroPercentage}>
                      {getMacroPercentage(analysisResult.totalFat, analysisResult.totalCalories)}%
                    </Text>
                  </View>
                  
                  <View style={styles.macroCard}>
                    <Text style={styles.macroValue}>{analysisResult.totalFiber}g</Text>
                    <Text style={styles.macroLabel}>Fiber</Text>
                    <Text style={styles.macroPercentage}>-</Text>
                  </View>
                </View>
              </View>

              {/* Food Items Breakdown */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Food Items</Text>
                {analysisResult.identifiedFoods.map((food, index) => (
                  <View key={index} style={styles.foodItemCard}>
                    <View style={styles.foodHeader}>
                      <Text style={styles.foodName}>{food.name}</Text>
                      <Text style={styles.foodQuantity}>{food.quantity}</Text>
                    </View>
                    
                    <View style={styles.foodNutrients}>
                      <View style={styles.nutrientItem}>
                        <Text style={styles.nutrientValue}>{food.calories}</Text>
                        <Text style={styles.nutrientLabel}>cal</Text>
                      </View>
                      <View style={styles.nutrientItem}>
                        <Text style={styles.nutrientValue}>{food.protein}g</Text>
                        <Text style={styles.nutrientLabel}>protein</Text>
                      </View>
                      <View style={styles.nutrientItem}>
                        <Text style={styles.nutrientValue}>{food.carbs}g</Text>
                        <Text style={styles.nutrientLabel}>carbs</Text>
                      </View>
                      <View style={styles.nutrientItem}>
                        <Text style={styles.nutrientValue}>{food.fat}g</Text>
                        <Text style={styles.nutrientLabel}>fat</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Nutritional Tips */}
              {analysisResult.nutritionalTips.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderWithIcon}>
                    <Target size={20} color={theme.colors.primary} />
                    <Text style={styles.sectionTitle}>Nutritional Tips</Text>
                  </View>
                  {analysisResult.nutritionalTips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Info size={16} color={theme.colors.primary} />
                      <Text style={styles.tipText}>{tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Daily Progress Indicator */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Daily Progress</Text>
                <View style={styles.progressCard}>
                  <Text style={styles.progressText}>
                    This meal represents approximately {Math.round((analysisResult.totalCalories / 2000) * 100)}% 
                    of a 2000-calorie daily intake
                  </Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${Math.min((analysisResult.totalCalories / 2000) * 100, 100)}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  loadingSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  errorContainer: {
    backgroundColor: theme.colors.expired,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  errorTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.error,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  calorieDisplay: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  calorieNumber: {
    fontFamily: 'Poppins-Bold',
    fontSize: 48,
    color: theme.colors.primary,
  },
  calorieLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: theme.colors.gray[600],
  },
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  mealType: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
  },
  healthScoreContainer: {
    alignItems: 'flex-end',
  },
  healthScoreLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[600],
  },
  healthScore: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  macroCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    flex: 1,
    minWidth: '22%',
    ...theme.shadows.sm,
  },
  macroValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: theme.colors.text,
  },
  macroLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.gray[600],
    marginTop: 2,
  },
  macroPercentage: {
    fontFamily: 'Inter-Regular',
    fontSize: 10,
    color: theme.colors.gray[500],
    marginTop: 2,
  },
  foodItemCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  foodName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
  },
  foodQuantity: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  foodNutrients: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutrientItem: {
    alignItems: 'center',
  },
  nutrientValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.text,
  },
  nutrientLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: theme.colors.gray[600],
    marginTop: 2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  tipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    flex: 1,
  },
  progressCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    ...theme.shadows.sm,
  },
  progressText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
  },
});