import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { PantryItem as PantryItemType } from '@/types';
import { theme } from '@/constants/theme';
import { CreditCard as Edit, Trash2 } from 'lucide-react-native';

interface PantryItemProps {
  item: PantryItemType;
  onPress: (item: PantryItemType) => void;
  onEdit: (item: PantryItemType) => void;
  onDelete: (itemId: string) => void;
}

export default function PantryItem({ item, onPress, onEdit, onDelete }: PantryItemProps) {
  const getExpiryStatus = () => {
    if (!item.expiryDate) return null;
    
    const today = new Date();
    const expiryDate = new Date(item.expiryDate);
    const warningDate = addDays(today, 3); // 3 days from now
    
    if (isBefore(expiryDate, today)) {
      return {
        status: 'expired',
        color: theme.colors.error,
        backgroundColor: theme.colors.expired,
        label: 'Expired',
      };
    } else if (isBefore(expiryDate, warningDate)) {
      return {
        status: 'expiring-soon',
        color: theme.colors.warning,
        backgroundColor: theme.colors.expirySoon,
        label: 'Expiring Soon',
      };
    } else {
      return {
        status: 'good',
        color: theme.colors.success,
        backgroundColor: theme.colors.fresh,
        label: format(expiryDate, 'MMM d, yyyy'),
      };
    }
  };

  const expiryStatus = getExpiryStatus();

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholder]} />
        )}
      </View>
      
      <View style={styles.contentContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.details}>
          {item.quantity} {item.unit}
        </Text>
        
        {expiryStatus && (
          <View style={[styles.expiryBadge, { backgroundColor: expiryStatus.backgroundColor }]}>
            <Text style={[styles.expiryText, { color: expiryStatus.color }]}>
              {expiryStatus.label}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onEdit(item)}
        >
          <Edit size={18} color={theme.colors.gray[600]} />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onDelete(item.id)}
        >
          <Trash2 size={18} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  imageContainer: {
    marginRight: theme.spacing.md,
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.md,
  },
  placeholder: {
    backgroundColor: theme.colors.gray[200],
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 4,
  },
  details: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    marginBottom: 8,
  },
  expiryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  expiryText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  actionsContainer: {
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  actionButton: {
    padding: 4,
  },
});