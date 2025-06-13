import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { Database } from '../types/database';

type PantryItem = Database['public']['Tables']['pantry_items']['Row'];
type PantryItemInsert = Database['public']['Tables']['pantry_items']['Insert'];
type PantryItemUpdate = Database['public']['Tables']['pantry_items']['Update'];

export function usePantryItems() {
  const { user } = useAuth();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchItems();
    } else {
      setItems([]);
      setLoading(false);
    }
  }, [user]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setItems(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch pantry items');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: Omit<PantryItemInsert, 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { data, error } = await supabase
        .from('pantry_items')
        .insert({ ...item, user_id: user.id })
        .select()
        .single();

      if (error) throw error;

      setItems(prev => [data, ...prev]);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      setError(message);
      throw new Error(message);
    }
  };

  const updateItem = async (id: string, updates: PantryItemUpdate) => {
    try {
      const { data, error } = await supabase
        .from('pantry_items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setItems(prev => prev.map(item => item.id === id ? data : item));
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update item';
      setError(message);
      throw new Error(message);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pantry_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete item';
      setError(message);
      throw new Error(message);
    }
  };

  const getExpiringItems = (days: number = 7) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + days);
    
    return items.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate <= cutoffDate;
    });
  };

  const getExpiredItems = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return items.filter(item => {
      if (!item.expiry_date) return false;
      const expiryDate = new Date(item.expiry_date);
      return expiryDate < today;
    });
  };

  const getItemsByCategory = () => {
    const categories: Record<string, PantryItem[]> = {};
    
    items.forEach(item => {
      const category = item.category || 'Uncategorized';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(item);
    });
    
    return categories;
  };

  return {
    items,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    fetchItems,
    getExpiringItems,
    getExpiredItems,
    getItemsByCategory,
  };
}