import { useState, useEffect, useCallback } from 'react';
import { PantryItem } from '@/types';
import { getPantryItems, savePantryItem, deletePantryItem, initializeStorage } from '@/utils/storage';
import { getFoodImage } from '@/utils/foodImages';

export function usePantryItems() {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      await initializeStorage(); // Make sure storage is initialized
      const data = await getPantryItems();
      console.log('usePantryItems: Fetched items from storage:', data.length, 'items');
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('usePantryItems: Error fetching items:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch pantry items'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = useCallback(async (item: PantryItem) => {
    try {
      console.log('usePantryItems: Adding item to pantry:', {
        id: item.id,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        hasImage: !!item.image
      });

      // Ensure the item has an image
      if (!item.image) {
        item.image = getFoodImage(item.name, item.category);
        console.log('usePantryItems: Added image to item:', item.image);
      }
      
      await savePantryItem(item);
      console.log('usePantryItems: Successfully saved item to storage');
      
      await fetchItems(); // Refresh the list
      console.log('usePantryItems: Refreshed items list after adding');
    } catch (err) {
      console.error('usePantryItems: Error adding item:', err);
      setError(err instanceof Error ? err : new Error('Failed to add pantry item'));
      throw err; // Re-throw so calling code can handle it
    }
  }, [fetchItems]);

  const updateItem = useCallback(async (item: PantryItem) => {
    try {
      console.log('usePantryItems: Updating item:', item.id, item.name);

      // Ensure the item has an image
      if (!item.image) {
        item.image = getFoodImage(item.name, item.category);
        console.log('usePantryItems: Added image to updated item:', item.image);
      }
      
      await savePantryItem(item);
      console.log('usePantryItems: Successfully updated item in storage');
      
      await fetchItems(); // Refresh the list
      console.log('usePantryItems: Refreshed items list after updating');
    } catch (err) {
      console.error('usePantryItems: Error updating item:', err);
      setError(err instanceof Error ? err : new Error('Failed to update pantry item'));
      throw err;
    }
  }, [fetchItems]);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      console.log('usePantryItems: Removing item:', itemId);
      await deletePantryItem(itemId);
      console.log('usePantryItems: Successfully removed item from storage');
      
      await fetchItems(); // Refresh the list
      console.log('usePantryItems: Refreshed items list after removing');
    } catch (err) {
      console.error('usePantryItems: Error removing item:', err);
      setError(err instanceof Error ? err : new Error('Failed to delete pantry item'));
      throw err;
    }
  }, [fetchItems]);

  const getExpiringItems = useCallback(() => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    return items.filter(item => {
      if (!item.expiryDate) return false;
      
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= threeDaysFromNow && expiryDate >= today;
    });
  }, [items]);

  const getExpiredItems = useCallback(() => {
    const today = new Date();
    
    return items.filter(item => {
      if (!item.expiryDate) return false;
      
      const expiryDate = new Date(item.expiryDate);
      return expiryDate < today;
    });
  }, [items]);

  return {
    items,
    loading,
    error,
    refreshItems: fetchItems,
    addItem,
    updateItem,
    removeItem,
    getExpiringItems,
    getExpiredItems,
  };
}