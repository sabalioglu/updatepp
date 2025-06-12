import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Modal, TextInput, Image, Alert } from 'react-native';
import { usePantryItems } from '@/hooks/usePantryItems';
import { theme } from '@/constants/theme';
import { X, Package, Search, Plus, CreditCard as Edit3, Calendar, Tag, Hash } from 'lucide-react-native';
import { PantryItem, FoodCategory } from '@/types';
import { getFoodImage } from '@/utils/foodImages';
import { generateUniqueId } from '@/utils/idGenerator';

interface ProductData {
  name: string;
  brand?: string;
  category: FoodCategory;
  image?: string;
  barcode: string;
  description?: string;
  estimatedShelfLife?: number; // days
}

interface ProductLookupModalProps {
  visible: boolean;
  onClose: () => void;
  barcode: string;
}

export default function ProductLookupModal({ visible, onClose, barcode }: ProductLookupModalProps) {
  const [loading, setLoading] = useState(false);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [manualEntry, setManualEntry] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state for manual entry or editing
  const [productName, setProductName] = useState('');
  const [productBrand, setProductBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('other');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [shelfLifeDays, setShelfLifeDays] = useState('7');
  const [notes, setNotes] = useState('');
  
  const { addItem } = usePantryItems();

  const foodCategories: FoodCategory[] = [
    'fruits', 'vegetables', 'dairy', 'meat', 'seafood', 'grains', 
    'canned', 'frozen', 'spices', 'condiments', 'baking', 'snacks', 'beverages', 'other'
  ];

  const commonUnits = ['pcs', 'g', 'kg', 'ml', 'l', 'cup', 'pack', 'can', 'bottle', 'box'];

  useEffect(() => {
    if (visible && barcode) {
      lookupProduct(barcode);
    }
  }, [visible, barcode]);

  const lookupProduct = async (barcodeData: string) => {
    setLoading(true);
    setError(null);
    setProductData(null);
    setManualEntry(false);

    try {
      console.log('ProductLookupModal: Looking up barcode:', barcodeData);
      
      // Try to lookup product using Open Food Facts API (free barcode database)
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcodeData}.json`);
      
      if (!response.ok) {
        throw new Error('Failed to lookup product');
      }

      const data = await response.json();
      console.log('ProductLookupModal: API response:', data);

      if (data.status === 1 && data.product) {
        const product = data.product;
        
        // Extract and clean product data
        const productName = product.product_name || product.product_name_en || 'Unknown Product';
        const brand = product.brands || '';
        const category = mapProductCategory(product.categories || '');
        const image = product.image_url || product.image_front_url;
        
        const productData: ProductData = {
          name: productName,
          brand: brand,
          category: category,
          image: image,
          barcode: barcodeData,
          description: product.generic_name || '',
          estimatedShelfLife: getEstimatedShelfLife(category),
        };

        setProductData(productData);
        
        // Pre-fill form with product data
        setProductName(productName);
        setProductBrand(brand);
        setSelectedCategory(category);
        setShelfLifeDays(getEstimatedShelfLife(category).toString());
        setNotes(`Scanned from barcode: ${barcodeData}`);
        
        console.log('ProductLookupModal: Product found:', productData);
      } else {
        // Product not found in database
        console.log('ProductLookupModal: Product not found in database');
        setManualEntry(true);
        setNotes(`Scanned from barcode: ${barcodeData}`);
      }
    } catch (error) {
      console.error('ProductLookupModal: Error looking up product:', error);
      setError('Failed to lookup product. You can add it manually.');
      setManualEntry(true);
      setNotes(`Scanned from barcode: ${barcodeData}`);
    } finally {
      setLoading(false);
    }
  };

  const mapProductCategory = (categories: string): FoodCategory => {
    const categoryLower = categories.toLowerCase();
    
    if (categoryLower.includes('fruit')) return 'fruits';
    if (categoryLower.includes('vegetable') || categoryLower.includes('veggie')) return 'vegetables';
    if (categoryLower.includes('dairy') || categoryLower.includes('milk') || categoryLower.includes('cheese')) return 'dairy';
    if (categoryLower.includes('meat') || categoryLower.includes('beef') || categoryLower.includes('chicken') || categoryLower.includes('pork')) return 'meat';
    if (categoryLower.includes('fish') || categoryLower.includes('seafood')) return 'seafood';
    if (categoryLower.includes('bread') || categoryLower.includes('cereal') || categoryLower.includes('grain')) return 'grains';
    if (categoryLower.includes('canned') || categoryLower.includes('preserved')) return 'canned';
    if (categoryLower.includes('frozen')) return 'frozen';
    if (categoryLower.includes('spice') || categoryLower.includes('herb')) return 'spices';
    if (categoryLower.includes('sauce') || categoryLower.includes('condiment')) return 'condiments';
    if (categoryLower.includes('baking') || categoryLower.includes('flour')) return 'baking';
    if (categoryLower.includes('snack') || categoryLower.includes('chip') || categoryLower.includes('cookie')) return 'snacks';
    if (categoryLower.includes('beverage') || categoryLower.includes('drink') || categoryLower.includes('juice')) return 'beverages';
    
    return 'other';
  };

  const getEstimatedShelfLife = (category: FoodCategory): number => {
    const shelfLifeMap: { [key in FoodCategory]: number } = {
      'fruits': 7,
      'vegetables': 10,
      'dairy': 7,
      'meat': 3,
      'seafood': 2,
      'grains': 365,
      'canned': 730,
      'frozen': 90,
      'spices': 365,
      'condiments': 180,
      'baking': 365,
      'snacks': 30,
      'beverages': 30,
      'other': 30,
    };
    
    return shelfLifeMap[category];
  };

  const addToPantry = async () => {
    if (!productName.trim()) {
      Alert.alert('Error', 'Please enter a product name.');
      return;
    }

    try {
      const today = new Date();
      const expiryDate = new Date(today);
      expiryDate.setDate(today.getDate() + parseInt(shelfLifeDays));

      const image = productData?.image || getFoodImage(productName, selectedCategory);

      const pantryItem: PantryItem = {
        id: generateUniqueId(),
        name: productName.trim(),
        category: selectedCategory,
        quantity: parseFloat(quantity) || 1,
        unit: unit,
        purchaseDate: today.toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString().split('T')[0],
        notes: notes.trim(),
        image: image,
      };

      console.log('ProductLookupModal: Adding item to pantry:', pantryItem);
      await addItem(pantryItem);

      Alert.alert(
        'Success!',
        `Added "${productName}" to your pantry.`,
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (error) {
      console.error('ProductLookupModal: Error adding item to pantry:', error);
      Alert.alert('Error', 'Failed to add item to pantry. Please try again.');
    }
  };

  const formatCategoryName = (category: FoodCategory) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Product Lookup</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Barcode Display */}
          <View style={styles.barcodeSection}>
            <Hash size={20} color={theme.colors.primary} />
            <Text style={styles.barcodeText}>Barcode: {barcode}</Text>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <Search size={48} color={theme.colors.primary} />
              <Text style={styles.loadingText}>Looking up product...</Text>
              <Text style={styles.loadingSubtext}>Searching product database</Text>
            </View>
          )}

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Product Not Found</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {(productData || manualEntry) && !loading && (
            <>
              {/* Product Info */}
              {productData && (
                <View style={styles.productCard}>
                  <View style={styles.productHeader}>
                    <Package size={24} color={theme.colors.success} />
                    <Text style={styles.productTitle}>Product Found!</Text>
                  </View>
                  
                  {productData.image && (
                    <Image source={{ uri: productData.image }} style={styles.productImage} />
                  )}
                  
                  <Text style={styles.productName}>{productData.name}</Text>
                  {productData.brand && (
                    <Text style={styles.productBrand}>{productData.brand}</Text>
                  )}
                  {productData.description && (
                    <Text style={styles.productDescription}>{productData.description}</Text>
                  )}
                </View>
              )}

              {manualEntry && !productData && (
                <View style={styles.manualEntryCard}>
                  <View style={styles.manualEntryHeader}>
                    <Edit3 size={24} color={theme.colors.warning} />
                    <Text style={styles.manualEntryTitle}>Manual Entry Required</Text>
                  </View>
                  <Text style={styles.manualEntryText}>
                    Product not found in database. Please enter the details manually.
                  </Text>
                </View>
              )}

              {/* Form */}
              <View style={styles.formSection}>
                <Text style={styles.formTitle}>Add to Pantry</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Product Name *</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productName}
                    onChangeText={setProductName}
                    placeholder="Enter product name"
                    placeholderTextColor={theme.colors.gray[400]}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Brand (Optional)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={productBrand}
                    onChangeText={setProductBrand}
                    placeholder="Enter brand name"
                    placeholderTextColor={theme.colors.gray[400]}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                    {foodCategories.map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryButton,
                          selectedCategory === category && styles.categoryButtonSelected,
                        ]}
                        onPress={() => setSelectedCategory(category)}
                      >
                        <Text style={[
                          styles.categoryButtonText,
                          selectedCategory === category && styles.categoryButtonTextSelected,
                        ]}>
                          {formatCategoryName(category)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.rowInputs}>
                  <View style={styles.inputGroupHalf}>
                    <Text style={styles.inputLabel}>Quantity</Text>
                    <TextInput
                      style={styles.textInput}
                      value={quantity}
                      onChangeText={setQuantity}
                      placeholder="1"
                      placeholderTextColor={theme.colors.gray[400]}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={styles.inputGroupHalf}>
                    <Text style={styles.inputLabel}>Unit</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll}>
                      {commonUnits.map((unitOption) => (
                        <TouchableOpacity
                          key={unitOption}
                          style={[
                            styles.unitButton,
                            unit === unitOption && styles.unitButtonSelected,
                          ]}
                          onPress={() => setUnit(unitOption)}
                        >
                          <Text style={[
                            styles.unitButtonText,
                            unit === unitOption && styles.unitButtonTextSelected,
                          ]}>
                            {unitOption}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Shelf Life (Days)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={shelfLifeDays}
                    onChangeText={setShelfLifeDays}
                    placeholder="7"
                    placeholderTextColor={theme.colors.gray[400]}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notes (Optional)</Text>
                  <TextInput
                    style={[styles.textInput, styles.textArea]}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="Additional notes..."
                    placeholderTextColor={theme.colors.gray[400]}
                    multiline
                    numberOfLines={3}
                  />
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Add Button */}
        {(productData || manualEntry) && !loading && (
          <View style={styles.addButtonContainer}>
            <TouchableOpacity style={styles.addButton} onPress={addToPantry}>
              <Plus size={20} color="white" />
              <Text style={styles.addButtonText}>Add to Pantry</Text>
            </TouchableOpacity>
          </View>
        )}
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
    borderBottomColor: theme.colors.gray[200],
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  barcodeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.gray[100],
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.xs,
  },
  barcodeText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.text,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.xxl,
  },
  loadingText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  loadingSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
  },
  errorContainer: {
    backgroundColor: theme.colors.expired,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  errorTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.error,
    marginBottom: theme.spacing.xs,
  },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.error,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  productHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  productTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.success,
  },
  productImage: {
    width: '100%',
    height: 150,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  productName: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  productBrand: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  productDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20,
  },
  manualEntryCard: {
    backgroundColor: theme.colors.expirySoon,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  manualEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  manualEntryTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: theme.colors.warning,
  },
  manualEntryText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  formSection: {
    backgroundColor: 'white',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  formTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputGroupHalf: {
    flex: 1,
  },
  inputLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  textInput: {
    borderWidth: 1,
    borderColor: theme.colors.gray[300],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: 'white',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginTop: theme.spacing.sm,
  },
  categoryButton: {
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
  },
  categoryButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  categoryButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: theme.colors.text,
  },
  categoryButtonTextSelected: {
    color: 'white',
  },
  rowInputs: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  unitScroll: {
    marginTop: theme.spacing.sm,
  },
  unitButton: {
    backgroundColor: theme.colors.gray[200],
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    marginRight: theme.spacing.xs,
  },
  unitButtonSelected: {
    backgroundColor: theme.colors.primary,
  },
  unitButtonText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: theme.colors.text,
  },
  unitButtonTextSelected: {
    color: 'white',
  },
  addButtonContainer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.gray[200],
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  addButtonText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: 'white',
  },
});