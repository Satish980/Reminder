/**
 * App-wide constants. Use for storage keys, notification channels, etc.
 */

export const STORAGE_KEYS = {
  REMINDERS: '@Reminder/reminders',
  CATEGORIES: '@Reminder/categories',
  THEME_MODE: '@Reminder/themeMode',
  COMPLETIONS: '@Reminder/completions',
} as const;

/** Android notification channel ID (required for Android 8+) */
export const NOTIFICATION_CHANNEL_ID = 'reminder-alerts';

/** Default ringtone for new reminders (system default sound) */
export const DEFAULT_RINGTONE = 'default' as const;

/** Default vibration pattern for new reminders */
export const DEFAULT_VIBRATION = 'default' as const;

/**
 * Android vibration patterns (ms): [delay, vibrate, pause, vibrate, ...].
 * Used when creating notification channels and for per-reminder alert config.
 */
export const VIBRATION_PATTERNS: Record<
  import('../shared/types').VibrationPatternId,
  number[]
> = {
  default: [0, 250, 250, 250],
  strong: [0, 500, 200, 500],
  double: [0, 200, 100, 200, 100, 200],
  none: [],
};

/** Snooze durations (minutes) offered when a reminder notification is triggered. */
export const SNOOZE_DURATIONS_MINUTES = [5, 10, 15, 30] as const;

/** Notification category ID for reminder notifications (enables action buttons e.g. Snooze, Done on iOS). */
export const REMINDER_CATEGORY_ID = 'reminder-actions';

/** Notification action identifier for marking reminder complete from the notification. */
export const NOTIFICATION_ACTION_MARK_DONE = 'mark_done';
