/**
 * Design tokens: spacing and radius.
 * Centralized so layout is consistent and theme-independent (same in light/dark).
 * Add typography or other tokens here as the theme system grows.
 */

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export type SpacingKey = keyof typeof spacing;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
} as const;

export type RadiusKey = keyof typeof radius;
