import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, TouchableOpacity } from 'react-native';
import { usePantryItems } from '@/hooks/usePantryItems';
import { useRecipes } from '@/hooks/useRecipes';
import { CircleAlert as AlertCircle, ArrowRight, ShoppingBag, Utensils } from 'lucide-react-native';
import { theme } from '@/constants/theme';
import { useRouter } from 'expo-router';
import ScreenContainer from '@/components/common/ScreenContainer';
import Header from '@/components/common/Header';
import { PantryItem, Recipe } from '@/types';
import { format } from 'date-fns';

export default function HomeScreen() {
  const router = useRouter();
  const { items, loading: pantryLoading, getExpiringItems, getExpiredItems } = usePantryItems();
  const { recipes, loading: recipesLoading, findRecipesFromPantry } = useRecipes();
  
  const expiringItems = getExpiringItems();
  const expiredItems = getExpiredItems();
  const suggestedRecipes = findRecipesFromPantry(items).slice(0, 3);
  const favoriteRecipes = recipes.filter(recipe => recipe.favorite).slice(0, 3);

  const handlePantryItemPress = (item: PantryItem) => {
    // Navigate to pantry item details (would be implemented in a real app)
    router.push('/pantry');
  };

  const handleRecipePress = (recipe: Recipe) => {
    // Navigate to recipe details (would be implemented in a real app)
    router.push('/recipes');
  };

  return (
    <ScreenContainer>
      <Header title="Pantry Pal" showSearch />
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Waste Prevention Alert */}
        {(expiringItems.length > 0 || expiredItems.length > 0) && (
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <AlertCircle size={24} color={theme.colors.warning} />
              <Text style={styles.alertTitle}>Food Waste Alert</Text>
            </View>
            
            <Text style={styles.alertText}>
              {expiredItems.length > 0 
                ? `You have ${expiredItems.length} expired items and ${expiringItems.length} items expiring soon.` 
                : `You have ${expiringItems.length} items expiring soon.`}
            </Text>
            
            <TouchableOpacity 
              style={styles.alertButton}
              onPress={() => router.push('/pantry')}
            >
              <Text style={styles.alertButtonText}>View Items</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* Meal Suggestion */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cook With What You Have</Text>
            <TouchableOpacity onPress={() => router.push('/recipes')}>
              <ArrowRight size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          {suggestedRecipes.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {suggestedRecipes.map(recipe => (
                <TouchableOpacity 
                  key={recipe.id} 
                  style={styles.recipeCard}
                  onPress={() => handleRecipePress(recipe)}
                >
                  <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                  <View style={styles.recipeCardContent}>
                    <Text style={styles.recipeCardTitle} numberOfLines={1}>{recipe.name}</Text>
                    <View style={styles.recipeCardMeta}>
                      <Utensils size={14} color={theme.colors.gray[600]} />
                      <Text style={styles.recipeCardMetaText}>
                        {recipe.prepTime + recipe.cookTime} min
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                Add more items to your pantry to get recipe suggestions.
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => router.push('/pantry')}
              >
                <Text style={styles.emptyButtonText}>Go to Pantry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Favorite Recipes */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Favorite Recipes</Text>
            <TouchableOpacity onPress={() => router.push('/recipes')}>
              <ArrowRight size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          {favoriteRecipes.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {favoriteRecipes.map(recipe => (
                <TouchableOpacity 
                  key={recipe.id} 
                  style={styles.recipeCard}
                  onPress={() => handleRecipePress(recipe)}
                >
                  <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                  <View style={styles.recipeCardContent}>
                    <Text style={styles.recipeCardTitle} numberOfLines={1}>{recipe.name}</Text>
                    <View style={styles.recipeCardMeta}>
                      <Utensils size={14} color={theme.colors.gray[600]} />
                      <Text style={styles.recipeCardMetaText}>
                        {recipe.prepTime + recipe.cookTime} min
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                You haven't favorited any recipes yet.
              </Text>
              <TouchableOpacity 
                style={styles.emptyButton}
                onPress={() => router.push('/recipes')}
              >
                <Text style={styles.emptyButtonText}>Explore Recipes</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {/* Expiring Soon */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Use Soon</Text>
            <TouchableOpacity onPress={() => router.push('/pantry')}>
              <ArrowRight size={20} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          
          {expiringItems.length > 0 ? (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.horizontalScrollContent}
            >
              {expiringItems.map(item => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.pantryItemCard}
                  onPress={() => handlePantryItemPress(item)}
                >
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.pantryItemImage} />
                  ) : (
                    <View style={[styles.pantryItemImage, styles.pantryItemPlaceholder]} />
                  )}
                  
                  <View style={styles.pantryItemContent}>
                    <Text style={styles.pantryItemName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.pantryItemExpiry}>
                      Expires: {format(new Date(item.expiryDate || ''), 'MMM d')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No items expiring soon.
              </Text>
            </View>
          )}
        </View>
        
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => router.push('/shopping-list')}
          >
            <ShoppingBag size={24} color="white" />
            <Text style={styles.quickActionText}>Shopping List</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.quickActionButton, { backgroundColor: theme.colors.secondary }]}
            onPress={() => router.push('/meal-plan')}
          >
            <Utensils size={24} color="white" />
            <Text style={styles.quickActionText}>Meal Plan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  alertContainer: {
    backgroundColor: theme.colors.expirySoon,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  alertTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: theme.colors.warning,
    marginLeft: theme.spacing.xs,
  },
  alertText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  alertButton: {
    backgroundColor: theme.colors.warning,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  alertButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
  },
  sectionContainer: {
    marginBottom: theme.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
  },
  horizontalScrollContent: {
    paddingRight: theme.spacing.md,
  },
  recipeCard: {
    width: 180,
    marginRight: theme.spacing.md,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  recipeImage: {
    width: '100%',
    height: 120,
  },
  recipeCardContent: {
    padding: theme.spacing.sm,
  },
  recipeCardTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  recipeCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeCardMetaText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[600],
    marginLeft: 4,
  },
  pantryItemCard: {
    width: 140,
    marginRight: theme.spacing.md,
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  pantryItemImage: {
    width: '100%',
    height: 100,
  },
  pantryItemPlaceholder: {
    backgroundColor: theme.colors.gray[200],
  },
  pantryItemContent: {
    padding: theme.spacing.sm,
  },
  pantryItemName: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 2,
  },
  pantryItemExpiry: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.warning,
  },
  emptyContainer: {
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
  },
  emptyButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'white',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  quickActionButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.md,
  },
  quickActionText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 14,
    color: 'white',
    marginTop: theme.spacing.xs,
  },
});