/**
 * App-wide constants. Use for storage keys, notification channels, etc.
 */

export const STORAGE_KEYS = {
  REMINDERS: '@Reminder/reminders',
  THEME_MODE: '@Reminder/themeMode',
  COMPLETIONS: '@Reminder/completions',
} as const;

/** Android notification channel ID (required for Android 8+) */
export const NOTIFICATION_CHANNEL_ID = 'reminder-alerts';

/** Default ringtone for new reminders (system default sound) */
export const DEFAULT_RINGTONE = 'default' as const;

/** Snooze durations (minutes) offered when a reminder notification is triggered. */
export const SNOOZE_DURATIONS_MINUTES = [5, 10, 15, 30] as const;

/** Notification category ID for reminder notifications (enables action buttons e.g. Snooze on iOS). */
export const REMINDER_CATEGORY_ID = 'reminder-actions';
