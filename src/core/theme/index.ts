/**
 * Centralized theme system: light and dark (and optional monochrome) modes.
 *
 * - Colors: semantic palette per mode (background, text, primary, etc.).
 * - Tokens: spacing and radius (mode-independent) for consistent layout.
 *
 * Usage: useTheme() or useThemeColors() from core/store. Components should
 * use these hooks so they stay theme-aware and reusable.
 *
 * To extend: add tokens in tokens.ts; add semantic keys to ColorPalette in colors.ts
 * and define values per palette. No hardcoded colors in components.
 */

export {
  type ColorMode,
  type ColorPalette,
  LIGHT_COLORS,
  DARK_COLORS,
  MONOCHROME_COLORS,
  getPalette,
  COLOR_MODES,
} from './colors';

export { spacing, radius, type SpacingKey, type RadiusKey } from './tokens';

import type { ColorMode } from './colors';
import { getPalette } from './colors';
import { spacing, radius } from './tokens';

/** Full theme for the current mode: colors + design tokens. */
export interface Theme {
  colors: ReturnType<typeof getPalette>;
  spacing: typeof spacing;
  radius: typeof radius;
}

/** Returns the full theme (colors + tokens) for a given mode. */
export function getTheme(mode: ColorMode): Theme {
  return {
    colors: getPalette(mode),
    spacing,
    radius,
  };
}

/** True when the mode uses a dark background (dark, monochrome with dark variant could be added later). */
export function isDarkMode(mode: ColorMode): boolean {
  return mode === 'dark';
}
