import React, { useState, useCallback } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useRecipes } from '@/hooks/useRecipes';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import RecipeCard from '@/components/recipes/RecipeCard';
import EmptyState from '@/components/common/EmptyState';
import { Recipe } from '@/types';
import { theme } from '@/constants/theme';
import { Heart } from 'lucide-react-native';

export default function SavedRecipesScreen() {
  const router = useRouter();
  const { recipes, loading, error, toggleFavorite } = useRecipes();
  
  const favoriteRecipes = recipes.filter(recipe => recipe.favorite);
  
  const handleRecipePress = (recipe: Recipe) => {
    // Navigate to recipe details (would be implemented in a real app)
    console.log('Recipe pressed:', recipe.name);
  };
  
  const handleFavoriteToggle = (recipeId: string, isFavorite: boolean) => {
    toggleFavorite(recipeId, isFavorite);
  };
  
  const renderItem = useCallback(({ item }: { item: Recipe }) => (
    <RecipeCard
      recipe={item}
      onPress={handleRecipePress}
      onFavoriteToggle={handleFavoriteToggle}
    />
  ), []);
  
  const renderEmptyState = () => (
    <EmptyState
      title="No saved recipes"
      message="You haven't saved any recipes yet. Browse recipes and tap the heart icon to save your favorites."
      actionLabel="Browse Recipes"
      onAction={() => router.push('/recipes')}
      icon={<Heart size={48} color={theme.colors.gray[400]} />}
    />
  );

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      <Header title="Saved Recipes" showBack onBackPress={() => router.back()} />
      
      <View style={styles.headerInfo}>
        <Text style={styles.recipeCount}>
          {favoriteRecipes.length} saved recipe{favoriteRecipes.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      {favoriteRecipes.length > 0 ? (
        <FlatList
          data={favoriteRecipes}
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerInfo: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray[200],
  },
  recipeCount: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[600],
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