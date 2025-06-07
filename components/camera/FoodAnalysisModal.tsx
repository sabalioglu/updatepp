import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { theme } from '@/constants/theme';
import { X, Clock, ChefHat, Lightbulb, ShoppingCart } from 'lucide-react-native';

interface Recipe {
  name: string;
  description: string;
  mainIngredients: string[];
  cookTime: string;
  difficulty: string;
}

interface FoodAnalysisResult {
  identifiedFoods: string[];
  freshnessAssessment: string;
  suggestedRecipes: Recipe[];
  storageTips: string[];
  complementaryIngredients: string[];
}

interface FoodAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  analysisResult: FoodAnalysisResult | null;
  loading: boolean;
  error: string | null;
}

export default function FoodAnalysisModal({
  visible,
  onClose,
  analysisResult,
  loading,
  error,
}: FoodAnalysisModalProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'hard':
        return theme.colors.error;
      default:
        return theme.colors.gray[600];
    }
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
          <Text style={styles.headerTitle}>Food Analysis</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Analyzing your food image...</Text>
              <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
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
              {/* Identified Foods */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Identified Foods</Text>
                <View style={styles.foodList}>
                  {analysisResult.identifiedFoods.map((food, index) => (
                    <View key={index} style={styles.foodItem}>
                      <Text style={styles.foodText}>{food}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Freshness Assessment */}
              {analysisResult.freshnessAssessment && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Freshness Assessment</Text>
                  <Text style={styles.assessmentText}>
                    {analysisResult.freshnessAssessment}
                  </Text>
                </View>
              )}

              {/* Suggested Recipes */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Suggested Recipes</Text>
                {analysisResult.suggestedRecipes.map((recipe, index) => (
                  <View key={index} style={styles.recipeCard}>
                    <View style={styles.recipeHeader}>
                      <Text style={styles.recipeName}>{recipe.name}</Text>
                      <View style={styles.recipeMeta}>
                        <View style={styles.metaItem}>
                          <Clock size={14} color={theme.colors.gray[600]} />
                          <Text style={styles.metaText}>{recipe.cookTime}</Text>
                        </View>
                        <View style={styles.metaItem}>
                          <ChefHat size={14} color={getDifficultyColor(recipe.difficulty)} />
                          <Text style={[styles.metaText, { color: getDifficultyColor(recipe.difficulty) }]}>
                            {recipe.difficulty}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    <Text style={styles.recipeDescription}>{recipe.description}</Text>
                    
                    {recipe.mainIngredients.length > 0 && (
                      <View style={styles.ingredientsList}>
                        <Text style={styles.ingredientsTitle}>Main Ingredients:</Text>
                        <Text style={styles.ingredientsText}>
                          {recipe.mainIngredients.join(', ')}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>

              {/* Storage Tips */}
              {analysisResult.storageTips.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderWithIcon}>
                    <Lightbulb size={20} color={theme.colors.warning} />
                    <Text style={styles.sectionTitle}>Storage Tips</Text>
                  </View>
                  {analysisResult.storageTips.map((tip, index) => (
                    <View key={index} style={styles.tipItem}>
                      <Text style={styles.tipText}>• {tip}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Complementary Ingredients */}
              {analysisResult.complementaryIngredients.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeaderWithIcon}>
                    <ShoppingCart size={20} color={theme.colors.primary} />
                    <Text style={styles.sectionTitle}>Suggested Additions</Text>
                  </View>
                  <View style={styles.complementaryList}>
                    {analysisResult.complementaryIngredients.map((ingredient, index) => (
                      <View key={index} style={styles.complementaryItem}>
                        <Text style={styles.complementaryText}>{ingredient}</Text>
                      </View>
                    ))}
                  </View>
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
  foodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  foodItem: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  foodText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
  },
  assessmentText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  recipeName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  recipeMeta: {
    gap: theme.spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[600],
  },
  recipeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  ingredientsList: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
  },
  ingredientsTitle: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.gray[600],
    marginBottom: 2,
  },
  ingredientsText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.text,
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
  complementaryList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  complementaryItem: {
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  complementaryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.text,
  },
});