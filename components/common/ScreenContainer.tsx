import React from 'react';
import { StyleSheet, View, SafeAreaView, StatusBar, ScrollView, ViewStyle } from 'react-native';

interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export default function ScreenContainer({
  children,
  scrollable = true,
  style,
  contentContainerStyle,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={[styles.container, style]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      {scrollable ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.contentContainer, contentContainerStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: 16,
  },
});