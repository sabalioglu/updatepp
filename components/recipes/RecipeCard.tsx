import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { Recipe } from '@/types';
import { theme } from '@/constants/theme';
import { Clock, Users, Heart } from 'lucide-react-native';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: (recipe: Recipe) => void;
  onFavoriteToggle: (recipeId: string, isFavorite: boolean) => void;
}

export default function RecipeCard({ 
  recipe, 
  onPress, 
  onFavoriteToggle 
}: RecipeCardProps) {
  const totalTime = recipe.prepTime + recipe.cookTime;
  
  const handleFavoritePress = () => {
    onFavoriteToggle(recipe.id, !recipe.favorite);
  };

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(recipe)}
      activeOpacity={0.8}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: recipe.image }} 
          style={styles.image} 
          resizeMode="cover"
        />
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={handleFavoritePress}
        >
          <Heart 
            size={24} 
            color={recipe.favorite ? theme.colors.error : 'white'} 
            fill={recipe.favorite ? theme.colors.error : 'transparent'}
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.title} numberOfLines={1}>{recipe.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{recipe.description}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Clock size={16} color={theme.colors.gray[600]} />
            <Text style={styles.metaText}>{totalTime} min</Text>
          </View>
          
          <View style={styles.metaItem}>
            <Users size={16} color={theme.colors.gray[600]} />
            <Text style={styles.metaText}>{recipe.servings} servings</Text>
          </View>
        </View>
        
        <View style={styles.tagsContainer}>
          {recipe.tags.slice(0, 3).map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: theme.spacing.md,
    ...theme.shadows.md,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
    width: '100%',
  },
  image: {
    height: '100%',
    width: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: theme.borderRadius.round,
    padding: theme.spacing.xs,
  },
  contentContainer: {
    padding: theme.spacing.md,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[700],
    marginBottom: theme.spacing.sm,
  },
  metaContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  metaText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginLeft: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    marginRight: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  tagText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: theme.colors.gray[700],
  },
});