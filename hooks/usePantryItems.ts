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
      setItems(data);
      setError(null);
    } catch (err) {
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
      // Ensure the item has an image
      if (!item.image) {
        item.image = getFoodImage(item.name, item.category);
      }
      
      await savePantryItem(item);
      await fetchItems(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add pantry item'));
    }
  }, [fetchItems]);

  const updateItem = useCallback(async (item: PantryItem) => {
    try {
      // Ensure the item has an image
      if (!item.image) {
        item.image = getFoodImage(item.name, item.category);
      }
      
      await savePantryItem(item);
      await fetchItems(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update pantry item'));
    }
  }, [fetchItems]);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      await deletePantryItem(itemId);
      await fetchItems(); // Refresh the list
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete pantry item'));
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