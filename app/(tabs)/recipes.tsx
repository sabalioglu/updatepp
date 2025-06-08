import React, { useState, useCallback } from 'react';
import { StyleSheet, FlatList, View, Text, TouchableOpacity } from 'react-native';
import { useRecipes } from '@/hooks/useRecipes';
import { usePantryItems } from '@/hooks/usePantryItems';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import RecipeCard from '@/components/recipes/RecipeCard';
import EmptyState from '@/components/common/EmptyState';
import { Recipe } from '@/types';
import { theme } from '@/constants/theme';
import { BookOpen, Camera } from 'lucide-react-native';

export default function RecipesScreen() {
  const router = useRouter();
  const { recipes, loading, error, toggleFavorite, findRecipesFromPantry } = useRecipes();
  const { items } = usePantryItems();
  const [filter, setFilter] = useState<'all' | 'favorites' | 'pantry'>('all');
  
  const filteredRecipes = useCallback(() => {
    switch (filter) {
      case 'favorites':
        return recipes.filter(recipe => recipe.favorite);
      case 'pantry':
        return findRecipesFromPantry(items);
      default:
        return recipes;
    }
  }, [filter, recipes, findRecipesFromPantry, items]);
  
  const handleAddRecipe = () => {
    // Navigate to add recipe screen (would be implemented in a real app)
    console.log('Add recipe');
  };
  
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
  
  const renderEmptyState = () => {
    if (items.length === 0) {
      return (
        <EmptyState
          title="Add pantry items to get recipe suggestions"
          message="Start by scanning your pantry items with the camera or adding them manually to get AI-powered recipe recommendations."
          actionLabel="Scan Pantry"
          onAction={() => router.push('/camera')}
          icon={<Camera size={48} color={theme.colors.gray[400]} />}
        />
      );
    }

    return (
      <EmptyState
        title="No recipes found"
        message={
          filter === 'favorites'
            ? "You haven't added any recipes to your favorites yet."
            : filter === 'pantry'
            ? "There are no recipes that match your current pantry items. Try adding more ingredients to your pantry."
            : "Add your favorite recipes to get started cooking delicious meals."
        }
        actionLabel={filter === 'all' ? "Add Recipe" : "View All Recipes"}
        onAction={() => {
          if (filter === 'all') {
            handleAddRecipe();
          } else {
            setFilter('all');
          }
        }}
        icon={<BookOpen size={48} color={theme.colors.gray[400]} />}
      />
    );
  };

  return (
    <ScreenContainer scrollable={false} style={styles.container}>
      <Header title="Recipes" showAdd showSearch onAddPress={handleAddRecipe} />
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'all' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('all')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'all' && styles.filterButtonTextActive,
            ]}
          >
            All Recipes
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'favorites' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('favorites')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'favorites' && styles.filterButtonTextActive,
            ]}
          >
            Favorites
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            filter === 'pantry' && styles.filterButtonActive,
          ]}
          onPress={() => setFilter('pantry')}
        >
          <Text
            style={[
              styles.filterButtonText,
              filter === 'pantry' && styles.filterButtonTextActive,
            ]}
          >
            Can Make Now
          </Text>
        </TouchableOpacity>
      </View>
      
      {filteredRecipes().length > 0 ? (
        <FlatList
          data={filteredRecipes()}
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
  filterContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  filterButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  filterButtonActive: {
    borderBottomColor: theme.colors.primary,
  },
  filterButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  filterButtonTextActive: {
    color: theme.colors.primary,
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