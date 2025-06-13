import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { theme } from '../../constants/theme';
import { FOOD_CATEGORIES } from '../../utils/foodCategories';
import { formatDateForInput, addDays } from '../../utils/dateUtils';
import { X, Calendar, Package, FileText, Camera } from 'lucide-react-native';

interface AddItemModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (item: {
    name: string;
    category: string;
    quantity: number;
    unit: string;
    expiry_date?: string;
    notes?: string;
  }) => Promise<void>;
}

const COMMON_UNITS = ['pcs', 'kg', 'g', 'L', 'ml', 'cups', 'tbsp', 'tsp', 'oz', 'lbs'];

export default function AddItemModal({ visible, onClose, onAdd }: AddItemModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState(FOOD_CATEGORIES[0]);
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [expiryDate, setExpiryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setCategory(FOOD_CATEGORIES[0]);
    setQuantity('1');
    setUnit('pcs');
    setExpiryDate('');
    setNotes('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter an item name');
      return;
    }

    const quantityNum = parseFloat(quantity);
    if (isNaN(quantityNum) || quantityNum <= 0) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    setLoading(true);

    try {
      await onAdd({
        name: name.trim(),
        category,
        quantity: quantityNum,
        unit,
        expiry_date: expiryDate || undefined,
        notes: notes.trim() || undefined,
      });

      resetForm();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to add item. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setQuickExpiryDate = (days: number) => {
    const date = addDays(new Date(), days);
    setExpiryDate(formatDateForInput(date));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Pantry Item</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.label}>Item Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Organic Bananas"
              placeholderTextColor={theme.colors.gray[500]}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
              <View style={styles.categoryContainer}>
                {FOOD_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryChip,
                      category === cat && styles.categoryChipSelected
                    ]}
                    onPress={() => setCategory(cat)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextSelected
                    ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          <View style={styles.row}>
            <View style={[styles.section, styles.flex1]}>
              <Text style={styles.label}>Quantity *</Text>
              <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                placeholder="1"
                keyboardType="numeric"
                placeholderTextColor={theme.colors.gray[500]}
              />
            </View>

            <View style={[styles.section, styles.flex1]}>
              <Text style={styles.label}>Unit</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
                <View style={styles.unitContainer}>
                  {COMMON_UNITS.map((u) => (
                    <TouchableOpacity
                      key={u}
                      style={[
                        styles.unitChip,
                        unit === u && styles.unitChipSelected
                      ]}
                      onPress={() => setUnit(u)}
                    >
                      <Text style={[
                        styles.unitChipText,
                        unit === u && styles.unitChipTextSelected
                      ]}>
                        {u}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Expiry Date</Text>
            <View style={styles.expiryContainer}>
              <TextInput
                style={[styles.input, styles.dateInput]}
                value={expiryDate}
                onChangeText={setExpiryDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.colors.gray[500]}
              />
              <Calendar size={20} color={theme.colors.gray[500]} style={styles.calendarIcon} />
            </View>
            <View style={styles.quickDateContainer}>
              <Text style={styles.quickDateLabel}>Quick set:</Text>
              {[3, 7, 14, 30].map((days) => (
                <TouchableOpacity
                  key={days}
                  style={styles.quickDateButton}
                  onPress={() => setQuickExpiryDate(days)}
                >
                  <Text style={styles.quickDateText}>{days}d</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes about this item..."
              placeholderTextColor={theme.colors.gray[500]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Package size={20} color="white" />
            <Text style={styles.addButtonText}>
              {loading ? 'Adding...' : 'Add to Pantry'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  section: {
    marginVertical: theme.spacing.md,
  },
  label: {
    ...theme.typography.captionMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    ...theme.typography.body,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryScroll: {
    marginHorizontal: -theme.spacing.lg,
  },
  categoryContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  categoryChip: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.round,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    ...theme.typography.captionMedium,
    color: theme.colors.text,
  },
  categoryChipTextSelected: {
    color: 'white',
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  flex1: {
    flex: 1,
  },
  unitScroll: {
    marginHorizontal: -theme.spacing.lg,
  },
  unitContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  unitChip: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 40,
    alignItems: 'center',
  },
  unitChipSelected: {
    backgroundColor: theme.colors.secondary,
    borderColor: theme.colors.secondary,
  },
  unitChipText: {
    ...theme.typography.small,
    color: theme.colors.text,
  },
  unitChipTextSelected: {
    color: 'white',
  },
  expiryContainer: {
    position: 'relative',
  },
  dateInput: {
    paddingRight: 50,
  },
  calendarIcon: {
    position: 'absolute',
    right: theme.spacing.md,
    top: '50%',
    marginTop: -10,
  },
  quickDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  quickDateLabel: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  quickDateButton: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
  },
  quickDateText: {
    ...theme.typography.small,
    color: 'white',
    fontWeight: '600',
  },
  notesInput: {
    height: 80,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginVertical: theme.spacing.lg,
    ...theme.shadows.md,
  },
  addButtonDisabled: {
    backgroundColor: theme.colors.gray[400],
  },
  addButtonText: {
    ...theme.typography.bodySemiBold,
    color: 'white',
  },
});