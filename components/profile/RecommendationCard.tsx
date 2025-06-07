import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { RecipeRecommendation } from '@/types';
import { theme } from '@/constants/theme';
import { Clock, Users, Star, TrendingUp } from 'lucide-react-native';

interface RecommendationCardProps {
  recommendation: RecipeRecommendation;
  onPress: () => void;
}

export default function RecommendationCard({ recommendation, onPress }: RecommendationCardProps) {
  const { recipe, score, reasons, availableIngredients, totalIngredients } = recommendation;
  
  const getScoreColor = () => {
    if (score >= 80) return theme.colors.success;
    if (score >= 60) return theme.colors.warning;
    return theme.colors.gray[500];
  };

  const getMatchPercentage = () => {
    return Math.round((availableIngredients / totalIngredients) * 100);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: recipe.image }} style={styles.image} />
        <View style={styles.scoreContainer}>
          <Star size={12} color="white" fill="white" />
          <Text style={styles.scoreText}>{Math.round(score)}</Text>
        </View>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.recipeName} numberOfLines={1}>{recipe.name}</Text>
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {recipe.description}
        </Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={12} color={theme.colors.gray[600]} />
            <Text style={styles.metaText}>
              {recipe.prepTime + recipe.cookTime}m
            </Text>
          </View>
          
          <View style={styles.metaItem}>
            <Users size={12} color={theme.colors.gray[600]} />
            <Text style={styles.metaText}>{recipe.servings}</Text>
          </View>
        </View>

        {availableIngredients > 0 && (
          <View style={styles.ingredientMatch}>
            <Text style={styles.matchText}>
              {getMatchPercentage()}% ingredients available
            </Text>
          </View>
        )}
        
        {reasons.length > 0 && (
          <View style={styles.reasonContainer}>
            <TrendingUp size={12} color={theme.colors.primary} />
            <Text style={styles.reasonText} numberOfLines={1}>
              {reasons[0]}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  imageContainer: {
    position: 'relative',
    height: 120,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  scoreContainer: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  scoreText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 10,
    color: 'white',
  },
  content: {
    padding: theme.spacing.sm,
  },
  recipeName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 2,
  },
  recipeDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[600],
    lineHeight: 16,
    marginBottom: theme.spacing.xs,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  metaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: theme.colors.gray[600],
  },
  ingredientMatch: {
    backgroundColor: theme.colors.fresh,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  matchText: {
    fontFamily: 'Inter-Medium',
    fontSize: 10,
    color: theme.colors.success,
  },
  reasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reasonText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: theme.colors.primary,
    flex: 1,
  },
});