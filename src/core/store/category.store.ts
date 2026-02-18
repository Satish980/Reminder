/**
 * Category state. Persisted to AsyncStorage. Categories are user-defined;
 * we seed with default names on first run only (no hardcoded category types in logic).
 */

import { create } from 'zustand';
import type { Category } from '../../shared/types';
import { STORAGE_KEYS } from '../constants';
import { storageService } from '../../services/storage.service';

/** Names to seed when the category list is empty (ids are generated). */
const SEED_NAMES = ['Health', 'Fitness', 'Study'] as const;

function generateId(): string {
  return `cat_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function seedCategories(): Category[] {
  return SEED_NAMES.map((name) => ({ id: generateId(), name }));
}

export interface CategoryState {
  categories: Category[];
  hydrated: boolean;
  addCategory: (name: string) => Promise<Category>;
  updateCategory: (id: string, name: string) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  hydrated: false,

  addCategory: async (name) => {
    const trimmed = name.trim();
    if (!trimmed) throw new Error('Category name is required');
    const category: Category = { id: generateId(), name: trimmed };
    set((s) => ({ categories: [...s.categories, category] }));
    await storageService.setItem(STORAGE_KEYS.CATEGORIES, get().categories);
    return category;
  },

  updateCategory: async (id, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    set((s) => ({
      categories: s.categories.map((c) => (c.id === id ? { ...c, name: trimmed } : c)),
    }));
    await storageService.setItem(STORAGE_KEYS.CATEGORIES, get().categories);
  },

  removeCategory: async (id) => {
    set((s) => ({ categories: s.categories.filter((c) => c.id !== id) }));
    await storageService.setItem(STORAGE_KEYS.CATEGORIES, get().categories);
  },

  hydrate: async () => {
    const raw = await storageService.getItem<unknown>(STORAGE_KEYS.CATEGORIES);
    let list: Category[] = [];
    if (Array.isArray(raw)) {
      list = raw.filter(
        (x): x is Category =>
          x != null &&
          typeof x === 'object' &&
          'id' in x &&
          'name' in x &&
          typeof (x as Category).id === 'string' &&
          typeof (x as Category).name === 'string'
      );
    }
    if (list.length === 0) {
      list = seedCategories();
      await storageService.setItem(STORAGE_KEYS.CATEGORIES, list);
    }
    set({ categories: list, hydrated: true });
  },
}));
