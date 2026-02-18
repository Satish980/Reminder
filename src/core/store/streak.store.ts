/**
 * Completion history and streak state. Persisted locally; data model is
 * sync-friendly (id, reminderId, completedAt). Streak logic is in core/streaks/streakCalc;
 * this store only holds completions and delegates calculation.
 */

import { create } from 'zustand';
import type { Completion, StreakResult } from '../../shared/types';
import { STORAGE_KEYS } from '../constants';
import { storageService } from '../../services/storage.service';
import { computeStreak } from '../streaks/streakCalc';

function generateId(): string {
  return `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export interface StreakState {
  completions: Completion[];
  hydrated: boolean;
  addCompletion: (reminderId: string) => Promise<void>;
  getStreakForReminder: (reminderId: string) => StreakResult;
  getCompletionsForReminder: (reminderId: string) => Completion[];
  hydrate: () => Promise<void>;
  /** Remove completions for a reminder (e.g. when reminder is deleted). Optional for analytics. */
  clearCompletionsForReminder: (reminderId: string) => Promise<void>;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  completions: [],
  hydrated: false,

  addCompletion: async (reminderId) => {
    const completion: Completion = {
      id: generateId(),
      reminderId,
      completedAt: Date.now(),
    };
    set((s) => ({ completions: [...s.completions, completion] }));
    await storageService.setItem(STORAGE_KEYS.COMPLETIONS, get().completions);
  },

  getStreakForReminder: (reminderId) => {
    const timestamps = get().completions
      .filter((c) => c.reminderId === reminderId)
      .map((c) => c.completedAt);
    return computeStreak(timestamps);
  },

  getCompletionsForReminder: (reminderId) => {
    return get().completions.filter((c) => c.reminderId === reminderId);
  },

  hydrate: async () => {
    const raw = await storageService.getItem<Completion[]>(STORAGE_KEYS.COMPLETIONS);
    const list = Array.isArray(raw)
      ? raw.filter(
          (c): c is Completion =>
            c != null &&
            typeof c === 'object' &&
            'id' in c &&
            'reminderId' in c &&
            typeof c.completedAt === 'number'
        )
      : [];
    set({ completions: list, hydrated: true });
  },

  clearCompletionsForReminder: async (reminderId) => {
    set((s) => ({
      completions: s.completions.filter((c) => c.reminderId !== reminderId),
    }));
    await storageService.setItem(STORAGE_KEYS.COMPLETIONS, get().completions);
  },
}));
