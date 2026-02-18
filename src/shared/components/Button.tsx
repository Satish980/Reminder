import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../../core/store';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

/** Theme-aware button: uses centralized theme (colors + radius + spacing). */
export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const theme = useTheme();
  const { colors, radius, spacing } = theme;
  const styles = useMemo(
    () =>
      StyleSheet.create({
        base: {
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 48,
        },
        primary: { backgroundColor: colors.primary },
        secondary: { backgroundColor: colors.textSecondary },
        outline: {
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.primary,
        },
        disabled: { opacity: 0.6 },
        text: {
          color: colors.surface,
          fontSize: 16,
          fontWeight: '600',
        },
        outlineText: { color: colors.primary },
      }),
    [colors, radius, spacing]
  );

  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.surface} />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'outline' && styles.outlineText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
