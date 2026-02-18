/**
 * Completion history and streak state. Persisted locally; schema supports
 * history and analytics (source, occurrenceDate). Streak logic in core/streaks/streakCalc.
 */

import { create } from 'zustand';
import type { Completion, CompletionSource, StreakResult } from '../../shared/types';
import { STORAGE_KEYS } from '../constants';
import { storageService } from '../../services/storage.service';
import { computeStreak } from '../streaks/streakCalc';

function generateId(): string {
  return `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function toOccurrenceDate(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export interface StreakState {
  completions: Completion[];
  hydrated: boolean;
  addCompletion: (reminderId: string, source?: CompletionSource) => Promise<void>;
  getStreakForReminder: (reminderId: string) => StreakResult;
  getCompletionsForReminder: (reminderId: string) => Completion[];
  hydrate: () => Promise<void>;
  clearCompletionsForReminder: (reminderId: string) => Promise<void>;
}

export const useStreakStore = create<StreakState>((set, get) => ({
  completions: [],
  hydrated: false,

  addCompletion: async (reminderId, source = 'in_app') => {
    const completedAt = Date.now();
    const completion: Completion = {
      id: generateId(),
      reminderId,
      completedAt,
      source,
      occurrenceDate: toOccurrenceDate(completedAt),
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
