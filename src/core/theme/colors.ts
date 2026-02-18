/**
 * Theme color configuration.
 * Single source of truth for app colors — change here for easier debugging and development.
 *
 * Semantic keys:
 * - background: main screen background
 * - surface: cards, modals, elevated UI
 * - text: primary text
 * - textSecondary: muted / secondary text
 * - primary: buttons, links, accent
 * - border: dividers, input borders
 * - danger: destructive actions (e.g. delete)
 * - warningBg / warningText: info banners (e.g. Expo Go notice)
 * - switch*: Switch component track/thumb
 * - chip*: segment/chip controls (e.g. interval selector)
 * - input*: TextInput background and border
 */

export type ColorMode = 'light' | 'dark' | 'monochrome';

export interface ColorPalette {
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  primary: string;
  border: string;
  danger: string;
  warningBg: string;
  warningText: string;
  switchTrackOff: string;
  switchTrackOn: string;
  switchThumbOn: string;
  switchThumbOff: string;
  chipBg: string;
  chipBgActive: string;
  chipText: string;
  chipTextActive: string;
  inputBorder: string;
  inputBg: string;
  inputText: string;
  placeholder: string;
}

/** Light theme — default, high contrast */
export const LIGHT_COLORS: ColorPalette = {
  background: '#f8fafc',
  surface: '#ffffff',
  text: '#0f172a',
  textSecondary: '#64748b',
  primary: '#2563eb',
  border: '#e2e8f0',
  danger: '#dc2626',
  warningBg: '#fef3c7',
  warningText: '#92400e',
  switchTrackOff: '#cbd5e1',
  switchTrackOn: '#93c5fd',
  switchThumbOn: '#2563eb',
  switchThumbOff: '#f1f5f9',
  chipBg: '#f1f5f9',
  chipBgActive: '#2563eb',
  chipText: '#475569',
  chipTextActive: '#ffffff',
  inputBorder: '#e2e8f0',
  inputBg: '#ffffff',
  inputText: '#1e293b',
  placeholder: '#94a3b8',
};

/** Dark theme — dark backgrounds, light text */
export const DARK_COLORS: ColorPalette = {
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f8fafc',
  textSecondary: '#94a3b8',
  primary: '#60a5fa',
  border: '#334155',
  danger: '#f87171',
  warningBg: '#422006',
  warningText: '#fcd34d',
  switchTrackOff: '#475569',
  switchTrackOn: '#1e3a5f',
  switchThumbOn: '#60a5fa',
  switchThumbOff: '#94a3b8',
  chipBg: '#334155',
  chipBgActive: '#64748b',
  chipText: '#cbd5e1',
  chipTextActive: '#f8fafc',
  inputBorder: '#334155',
  inputBg: '#1e293b',
  inputText: '#f8fafc',
  placeholder: '#64748b',
};

/** Monochrome theme — grayscale only, no blue accent */
export const MONOCHROME_COLORS: ColorPalette = {
  background: '#fafafa',
  surface: '#ffffff',
  text: '#171717',
  textSecondary: '#737373',
  primary: '#404040',
  border: '#e5e5e5',
  danger: '#b91c1c',
  warningBg: '#f5f5f5',
  warningText: '#525252',
  switchTrackOff: '#d4d4d4',
  switchTrackOn: '#a3a3a3',
  switchThumbOn: '#404040',
  switchThumbOff: '#fafafa',
  chipBg: '#e5e5e5',
  chipBgActive: '#404040',
  chipText: '#525252',
  chipTextActive: '#fafafa',
  inputBorder: '#e5e5e5',
  inputBg: '#ffffff',
  inputText: '#171717',
  placeholder: '#a3a3a3',
};

const PALETTES: Record<ColorMode, ColorPalette> = {
  light: LIGHT_COLORS,
  dark: DARK_COLORS,
  monochrome: MONOCHROME_COLORS,
};

export function getPalette(mode: ColorMode): ColorPalette {
  return PALETTES[mode];
}

export const COLOR_MODES: ColorMode[] = ['light', 'dark', 'monochrome'];
