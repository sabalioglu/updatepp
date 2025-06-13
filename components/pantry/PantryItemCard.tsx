import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { theme } from '../../constants/theme';
import { formatRelativeDate, getExpiryStatus } from '../../utils/dateUtils';
import { getCategoryColor, getCategoryIcon } from '../../utils/foodCategories';
import { Calendar, Package, Edit3, Trash2 } from 'lucide-react-native';
import type { Database } from '../../types/database';

type PantryItem = Database['public']['Tables']['pantry_items']['Row'];

interface PantryItemCardProps {
  item: PantryItem;
  onEdit: (item: PantryItem) => void;
  onDelete: (item: PantryItem) => void;
}

export default function PantryItemCard({ item, onEdit, onDelete }: PantryItemCardProps) {
  const expiryStatus = getExpiryStatus(item.expiry_date);
  const categoryColor = getCategoryColor(item.category || 'Other');
  const categoryIcon = getCategoryIcon(item.category || 'Other');

  const getStatusColor = () => {
    switch (expiryStatus) {
      case 'expired': return theme.colors.expired;
      case 'expiring': return theme.colors.expiring;
      default: return theme.colors.fresh;
    }
  };

  const getStatusTextColor = () => {
    switch (expiryStatus) {
      case 'expired': return theme.colors.error;
      case 'expiring': return '#B8860B';
      default: return theme.colors.success;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getStatusColor() }]}>
      <View style={styles.header}>
        <View style={styles.itemInfo}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryIcon}>{categoryIcon}</Text>
            <View style={[styles.categoryDot, { backgroundColor: categoryColor }]} />
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.categoryName}>{item.category || 'Other'}</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => onEdit(item)}>
            <Edit3 size={16} color={theme.colors.gray[600]} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => onDelete(item)}>
            <Trash2 size={16} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      {item.image && (
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      )}

      <View style={styles.details}>
        <View style={styles.quantityContainer}>
          <Package size={16} color={theme.colors.gray[600]} />
          <Text style={styles.quantity}>
            {item.quantity} {item.unit || 'pcs'}
          </Text>
        </View>

        {item.expiry_date && (
          <View style={styles.expiryContainer}>
            <Calendar size={16} color={getStatusTextColor()} />
            <Text style={[styles.expiryText, { color: getStatusTextColor() }]}>
              {formatRelativeDate(item.expiry_date)}
            </Text>
          </View>
        )}
      </View>

      {item.notes && (
        <Text style={styles.notes} numberOfLines={2}>
          {item.notes}
        </Text>
      )}

      <Text style={styles.addedDate}>
        Added {formatRelativeDate(item.created_at!)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  categoryIcon: {
    fontSize: 20,
    marginRight: theme.spacing.xs,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nameContainer: {
    flex: 1,
  },
  itemName: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.text,
    marginBottom: 2,
  },
  categoryName: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  quantity: {
    ...theme.typography.captionMedium,
    color: theme.colors.text,
  },
  expiryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  expiryText: {
    ...theme.typography.captionMedium,
    fontWeight: '600',
  },
  notes: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: theme.spacing.xs,
  },
  addedDate: {
    ...theme.typography.small,
    color: theme.colors.textMuted,
  },
});