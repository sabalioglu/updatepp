import React from 'react';
import { SafeAreaView, ViewProps } from 'react-native';

interface ScreenContainerProps extends ViewProps {
  children: React.ReactNode;
}

/**
 * Minimal wrapper that applies SafeArea padding only.
 * We can extend it later with custom theming or scroll behaviour.
 */
export default function ScreenContainer({
  children,
  style,
  ...rest
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: '#fff' }, style]} {...rest}>
      {children}
    </SafeAreaView>
  );
}