import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ViewStyle } from 'react-native';
import { ArrowLeft, Plus, Search } from 'lucide-react-native';
import { theme } from '@/constants/theme';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showAdd?: boolean;
  showSearch?: boolean;
  onBackPress?: () => void;
  onAddPress?: () => void;
  onSearchPress?: () => void;
  style?: ViewStyle;
}

export default function Header({
  title,
  showBack = false,
  showAdd = false,
  showSearch = false,
  onBackPress,
  onAddPress,
  onSearchPress,
  style,
}: HeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.leftContainer}>
        {showBack && (
          <TouchableOpacity onPress={onBackPress} style={styles.iconButton}>
            <ArrowLeft size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.rightContainer}>
        {showSearch && (
          <TouchableOpacity onPress={onSearchPress} style={styles.iconButton}>
            <Search size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
        
        {showAdd && (
          <TouchableOpacity onPress={onAddPress} style={styles.iconButton}>
            <Plus size={24} color={theme.colors.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.background,
  },
  leftContainer: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.sm,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: theme.colors.text,
    textAlign: 'center',
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
});