/**
 * Theme (color mode) state. Persisted to AsyncStorage.
 */

import { create } from 'zustand';
import type { ColorMode } from '../theme/colors';
import { getPalette } from '../theme/colors';
import { STORAGE_KEYS } from '../constants';
import { storageService } from '../../services/storage.service';

const DEFAULT_MODE: ColorMode = 'dark';

export interface ThemeState {
  mode: ColorMode;
  hydrated: boolean;
  setMode: (mode: ColorMode) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: DEFAULT_MODE,
  hydrated: false,

  setMode: async (mode) => {
    set({ mode });
    await storageService.setItem(STORAGE_KEYS.THEME_MODE, mode);
  },

  hydrate: async () => {
    const stored = await storageService.getItem<ColorMode>(STORAGE_KEYS.THEME_MODE);
    set({
      mode: stored && ['light', 'dark', 'monochrome'].includes(stored) ? stored : DEFAULT_MODE,
      hydrated: true,
    });
  },
}));

/** Hook: current color palette for the active mode. */
export function useThemeColors() {
  const mode = useThemeStore((s) => s.mode);
  return getPalette(mode);
}
