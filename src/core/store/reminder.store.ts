/**
 * Reminder state and actions. Persisted to AsyncStorage and synced with
 * local notifications. Logic lives here; UI only reads and dispatches.
 */

import { create } from 'zustand';
import type { Reminder, CreateReminderInput } from '../../shared/types';
import { migrateReminder } from '../../shared/migrateReminder';
import { STORAGE_KEYS } from '../constants';
import { storageService } from '../../services/storage.service';
import * as notificationService from '../../services/notification.service';

export interface ReminderState {
  reminders: Reminder[];
  hydrated: boolean;
  addReminder: (input: CreateReminderInput) => Promise<Reminder>;
  updateReminder: (id: string, input: Partial<CreateReminderInput>) => Promise<void>;
  removeReminder: (id: string) => Promise<void>;
  setEnabled: (id: string, enabled: boolean) => Promise<void>;
  hydrate: () => Promise<void>;
}

function generateId(): string {
  return `rem_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export const useReminderStore = create<ReminderState>((set, get) => ({
  reminders: [],
  hydrated: false,

  addReminder: async (input) => {
    const reminder: Reminder = {
      ...input,
      id: generateId(),
      createdAt: Date.now(),
    };
    set((s) => ({ reminders: [...s.reminders, reminder] }));
    await storageService.setItem(STORAGE_KEYS.REMINDERS, get().reminders);
    if (reminder.enabled) {
      await notificationService.scheduleReminder(reminder);
    }
    return reminder;
  },

  updateReminder: async (id, input) => {
    const prev = get().reminders.find((r) => r.id === id);
    if (!prev) return;
    const updated: Reminder = { ...prev, ...input };
    set((s) => ({
      reminders: s.reminders.map((r) => (r.id === id ? updated : r)),
    }));
    await storageService.setItem(STORAGE_KEYS.REMINDERS, get().reminders);
    // Cancel all existing notifications for this reminder (recurring + snoozed) before rescheduling
    // so edits never leave duplicate or stale alarms.
    await notificationService.cancelReminderNotifications(id);
    if (updated.enabled) {
      await notificationService.scheduleReminder(updated);
    }
  },

  removeReminder: async (id) => {
    // Cancel notifications first so we never leave orphaned scheduled alarms if persistence fails.
    await notificationService.cancelReminderNotifications(id);
    set((s) => ({ reminders: s.reminders.filter((r) => r.id !== id) }));
    await storageService.setItem(STORAGE_KEYS.REMINDERS, get().reminders);
  },

  setEnabled: async (id, enabled) => {
    return get().updateReminder(id, { enabled });
  },

  hydrate: async () => {
    const raw = await storageService.getItem<unknown[]>(STORAGE_KEYS.REMINDERS);
    const list = (raw ?? [])
      .filter((r): r is Record<string, unknown> & { id: string; title: string; createdAt: number } => r != null && typeof r === 'object' && 'id' in r && 'title' in r)
      .map((r) => migrateReminder(r as Parameters<typeof migrateReminder>[0]));
    set({ reminders: list, hydrated: true });
    await storageService.setItem(STORAGE_KEYS.REMINDERS, list);
    await notificationService.cancelAllScheduledNotifications();
    for (const r of list) {
      if (r.enabled) await notificationService.scheduleReminder(r);
    }
  },
}));
