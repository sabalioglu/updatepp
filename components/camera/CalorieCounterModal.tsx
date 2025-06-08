import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { theme } from '@/constants/theme';
import { X, Zap, TrendingUp, Target, Info } from 'lucide-react-native';

interface NutritionAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  healthScore: number;
  mealType: string;
  portionSize: string;
  tips: string[];
}

interface CalorieCounterModalProps {
  visible: boolean;
  onClose: () => void;
  analysisResult: NutritionAnalysis | null;
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

  const getMacroPercentage = (macro: number, calories: number) => {
    // Protein and carbs: 4 calories per gram, Fat: 9 calories per gram
    const macroCalories = macro * (macro === analysisResult?.fat ? 9 : 4);
    return Math.round((macroCalories / calories) * 100);
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
              {/* Calorie Summary */}
              <View style={styles.calorieCard}>
                <View style={styles.calorieHeader}>
                  <Zap size={32} color={theme.colors.primary} />
                  <View style={styles.calorieInfo}>
                    <Text style={styles.calorieCount}>{analysisResult.calories}</Text>
                    <Text style={styles.calorieLabel}>calories</Text>
                  </View>
                </View>
                
                <View style={styles.mealInfo}>
                  <Text style={styles.mealType}>{analysisResult.mealType}</Text>
                  <Text style={styles.portionSize}>{analysisResult.portionSize}</Text>
                </View>
              </View>

              {/* Health Score */}
              <View style={styles.healthScoreCard}>
                <View style={styles.healthScoreHeader}>
                  <Target size={24} color={getHealthScoreColor(analysisResult.healthScore)} />
                  <Text style={styles.healthScoreTitle}>Health Score</Text>
                </View>
                
                <View style={styles.healthScoreContainer}>
                  <View style={styles.healthScoreCircle}>
                    <Text style={[
                      styles.healthScoreValue,
                      { color: getHealthScoreColor(analysisResult.healthScore) }
                    ]}>
                      {analysisResult.healthScore}
                    </Text>
                    <Text style={styles.healthScoreMax}>/100</Text>
                  </View>
                  
                  <View style={styles.healthScoreBar}>
                    <View 
                      style={[
                        styles.healthScoreFill,
                        { 
                          width: `${analysisResult.healthScore}%`,
                          backgroundColor: getHealthScoreColor(analysisResult.healthScore)
                        }
                      ]} 
                    />
                  </View>
                </div>
              </View>

              {/* Macronutrients */}
              <View style={styles.macroCard}>
                <Text style={styles.sectionTitle}>Macronutrients</Text>
                
                <View style={styles.macroGrid}>
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{analysisResult.protein}g</Text>
                    <Text style={styles.macroLabel}>Protein</Text>
                    <Text style={styles.macroPercentage}>
                      {getMacroPercentage(analysisResult.protein, analysisResult.calories)}%
                    </Text>
                  </View>
                  
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{analysisResult.carbs}g</Text>
                    <Text style={styles.macroLabel}>Carbs</Text>
                    <Text style={styles.macroPercentage}>
                      {getMacroPercentage(analysisResult.carbs, analysisResult.calories)}%
                    </Text>
                  </View>
                  
                  <View style={styles.macroItem}>
                    <Text style={styles.macroValue}>{analysisResult.fat}g</Text>
                    <Text style={styles.macroLabel}>Fat</Text>
                    <Text style={styles.macroPercentage}>
                      {getMacroPercentage(analysisResult.fat, analysisResult.calories)}%
                    </Text>
                  </View>
                </View>
              </View>

              {/* Additional Nutrients */}
              <View style={styles.nutrientCard}>
                <Text style={styles.sectionTitle}>Additional Nutrients</Text>
                
                <View style={styles.nutrientList}>
                  <View style={styles.nutrientRow}>
                    <Text style={styles.nutrientLabel}>Fiber</Text>
                    <Text style={styles.nutrientValue}>{analysisResult.fiber}g</Text>
                  </View>
                  
                  <View style={styles.nutrientRow}>
                    <Text style={styles.nutrientLabel}>Sugar</Text>
                    <Text style={styles.nutrientValue}>{analysisResult.sugar}g</Text>
                  </View>
                  
                  <View style={styles.nutrientRow}>
                    <Text style={styles.nutrientLabel}>Sodium</Text>
                    <Text style={styles.nutrientValue}>{analysisResult.sodium}mg</Text>
                  </View>
                </View>
              </View>

              {/* Health Tips */}
              {analysisResult.tips.length > 0 && (
                <View style={styles.tipsCard}>
                  <View style={styles.tipsHeader}>
                    <Info size={20} color={theme.colors.primary} />
                    <Text style={styles.sectionTitle}>Nutritional Tips</Text>
                  </View>
                  
                  {analysisResult.tips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Text style={styles.tipText}>• {tip}</Text>
                    </View>
                  ))}
                </View>
              )}
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
  calorieCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  calorieHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  calorieInfo: {
    marginLeft: theme.spacing.md,
    alignItems: 'center',
  },
  calorieCount: {
    fontFamily: 'Poppins-Bold',
    fontSize: 36,
    color: theme.colors.primary,
  },
  calorieLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  mealInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealType: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
  },
  portionSize: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  healthScoreCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  healthScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  healthScoreTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  healthScoreContainer: {
    alignItems: 'center',
  },
  healthScoreCircle: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: theme.spacing.sm,
  },
  healthScoreValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 32,
  },
  healthScoreMax: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.gray[600],
  },
  healthScoreBar: {
    width: '100%',
    height: 8,
    backgroundColor: theme.colors.gray[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  healthScoreFill: {
    height: '100%',
  },
  macroCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  macroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: theme.colors.text,
  },
  macroLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[600],
    marginTop: 2,
  },
  macroPercentage: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: theme.colors.primary,
    marginTop: 2,
  },
  nutrientCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  nutrientList: {
    gap: theme.spacing.sm,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
  nutrientLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.text,
  },
  nutrientValue: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.gray[700],
  },
  tipsCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  tipItem: {
    marginBottom: theme.spacing.xs,
  },
  tipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
});