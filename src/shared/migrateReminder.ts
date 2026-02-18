/**
 * Migrates stored reminders to the current Reminder shape (schedule-based).
 */

import type { Reminder, ScheduleConfig } from './types';

type RawReminder = Record<string, unknown> & {
  id: string;
  title: string;
  enabled: boolean;
  ringtone?: string;
  createdAt: number;
  schedule?: ScheduleConfig;
  intervalType?: 'hourly' | 'daily' | 'custom';
  customIntervalMinutes?: number;
  dailyTime?: string;
  soundEnabled?: boolean;
};

function isScheduleConfig(s: unknown): s is ScheduleConfig {
  if (!s || typeof s !== 'object') return false;
  const k = (s as { kind?: string }).kind;
  return k === 'interval' || k === 'daily' || k === 'weekly';
}

function legacyToSchedule(raw: RawReminder): ScheduleConfig {
  if (raw.schedule && isScheduleConfig(raw.schedule)) return raw.schedule;
  switch (raw.intervalType) {
    case 'hourly':
      return { kind: 'interval', value: 60, unit: 'minutes' };
    case 'daily':
      return {
        kind: 'daily',
        times: [typeof raw.dailyTime === 'string' && raw.dailyTime ? raw.dailyTime : '09:00'],
      };
    case 'custom':
      return {
        kind: 'interval',
        value: Math.max(1, Number(raw.customIntervalMinutes) || 60),
        unit: 'minutes',
      };
    default:
      return { kind: 'interval', value: 60, unit: 'minutes' };
  }
}

/**
 * Normalizes a raw stored reminder to Reminder (adds schedule from legacy fields if needed).
 */
export function migrateReminder(raw: RawReminder): Reminder {
  const schedule = legacyToSchedule(raw);
  const ringtone =
    typeof raw.ringtone === 'string'
      ? raw.ringtone
      : raw.soundEnabled === false
        ? 'none'
        : 'default';
  return {
    id: raw.id,
    title: String(raw.title),
    enabled: Boolean(raw.enabled),
    schedule,
    ringtone,
    createdAt: Number(raw.createdAt),
  };
}
