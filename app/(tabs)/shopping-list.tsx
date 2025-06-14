import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import { ShoppingBag } from 'lucide-react-native';

const theme = {
  colors: {
    background: '#FFFFFF',
    text: '#333333',
    gray: {
      400: '#BDBDBD',
      600: '#757575',
    }
  },
  spacing: {
    md: 16,
    lg: 24,
    xl: 32,
  }
};

export default function ShoppingListScreen() {
  return (
    <ScreenContainer style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Shopping List</Text>
      </View>
      
      <View style={styles.emptyState}>
        <ShoppingBag size={64} color={theme.colors.gray[400]} />
        <Text style={styles.emptyTitle}>Your shopping list is empty</Text>
        <Text style={styles.emptyText}>
          Add items to your shopping list to make grocery shopping easier.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    fontFamily: 'Poppins-Bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
    fontFamily: 'Poppins-SemiBold',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.gray[600],
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Inter-Regular',
  },
});