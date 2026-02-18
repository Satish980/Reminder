/**
 * Pending snooze state: when user opens the app by tapping a reminder notification
 * (without choosing a Snooze action), we show an in-app prompt to snooze. This store
 * holds that pending reminder so the UI can display "Snooze [title]?" and dispatch
 * to the snooze service when the user picks a duration. Scheduling stays in the service.
 */

import { create } from 'zustand';

export interface PendingSnooze {
  reminderId: string;
  title: string;
}

interface SnoozeState {
  pendingSnooze: PendingSnooze | null;
  setPendingSnooze: (p: PendingSnooze | null) => void;
  clearPendingSnooze: () => void;
}

export const useSnoozeStore = create<SnoozeState>((set) => ({
  pendingSnooze: null,
  setPendingSnooze: (p) => set({ pendingSnooze: p }),
  clearPendingSnooze: () => set({ pendingSnooze: null }),
}));
