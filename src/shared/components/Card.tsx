import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../core/store';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/** Theme-aware card: uses centralized theme (colors + radius + spacing). */
export function Card({ children, style }: CardProps) {
  const theme = useTheme();
  const { colors, radius, spacing } = theme;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        card: {
          backgroundColor: colors.surface,
          borderRadius: radius.lg,
          padding: spacing.md,
          shadowColor: colors.text,
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.08,
          shadowRadius: 4,
          elevation: 2,
        },
      }),
    [colors, radius, spacing]
  );
  return <View style={[styles.card, style]}>{children}</View>;
}
