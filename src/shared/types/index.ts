/**
 * Shared types used across the app.
 * Kept in shared/ to allow features and core to reference common contracts.
 */

/** Schedule kinds. Not hardcoded in logic — use schedule config and helpers. */
export type ScheduleKind = 'interval' | 'daily' | 'weekly';

/** Repeating every X minutes or hours. */
export interface IntervalSchedule {
  kind: 'interval';
  /** Numeric value (e.g. 30 for "every 30 minutes"). */
  value: number;
  unit: 'minutes' | 'hours';
}

/** One or more time slots per day (every day). */
export interface DailySchedule {
  kind: 'daily';
  /** Times in 24h "HH:mm". At least one. */
  times: string[];
}

/** Specific weekdays with one or more time slots per day. */
export interface WeeklySchedule {
  kind: 'weekly';
  /** 1 = Sunday … 7 = Saturday. At least one. */
  weekdays: number[];
  /** Times in 24h "HH:mm". At least one. */
  times: string[];
}

/** Reminder schedule configuration. Drives notification triggers. */
export type ScheduleConfig = IntervalSchedule | DailySchedule | WeeklySchedule;

/**
 * Built-in ringtone options. 'none' = silent; 'default' = system default.
 */
export type RingtoneId = 'none' | 'default';

/**
 * Stored ringtone value: built-in id or custom URI from device.
 * Custom format: "custom:<uri>" (e.g. from document picker or media library).
 */
export type RingtoneValue = RingtoneId | string;

/**
 * Sound configuration for a notification. Abstracted for future expansion
 * (e.g. volume, fade-in, custom asset keys).
 */
export interface NotificationSoundConfig {
  /** Which sound to play: 'none' | 'default' | 'custom:<uri>' */
  ringtone: RingtoneValue;
}

/**
 * Built-in vibration pattern ids. Maps to platform-specific patterns (e.g. Android number[]).
 */
export type VibrationPatternId = 'default' | 'strong' | 'double' | 'none';

/**
 * Reminder entity. Schedule is configurable via ScheduleConfig (no hardcoded interval types).
 */
export interface Reminder {
  id: string;
  /** User-defined label (e.g. "Water reminder", "Walking break") */
  title: string;
  enabled: boolean;
  /** When present, used for scheduling. Legacy reminders may have intervalType/dailyTime/customIntervalMinutes; migrate to schedule on load. */
  schedule: ScheduleConfig;
  /** Which sound to play: 'none' | 'default' | 'custom:<uri>' for device audio */
  ringtone: RingtoneValue;
  /** Vibration pattern for notifications. Omit = default. */
  vibration?: VibrationPatternId;
  createdAt: number;
}

/**
 * Alert preferences for a notification (sound + vibration). Used when scheduling
 * so we can extend with more options later without changing call sites.
 */
export interface NotificationAlertConfig {
  sound: NotificationSoundConfig;
  vibration: VibrationPatternId;
}

/** Input to create a new reminder (id and createdAt are set by the store). */
export type CreateReminderInput = Omit<Reminder, 'id' | 'createdAt'>;

/** Input to update an existing reminder (partial). */
export type UpdateReminderInput = Partial<Omit<Reminder, 'id' | 'createdAt'>>;

/** Legacy shape for migration from old intervalType-based reminders. */
export interface LegacyReminderSchedule {
  intervalType?: 'hourly' | 'daily' | 'custom';
  customIntervalMinutes?: number;
  dailyTime?: string;
}

/** Where the completion was recorded (in-app vs notification action). */
export type CompletionSource = 'in_app' | 'notification';

/**
 * A single completion event: one "occurrence" of a reminder marked done.
 * Stored separately from reminders; supports history, streaks, and analytics.
 *
 * Storage schema (sync- and analytics-friendly):
 * - id: unique, dedup and conflict resolution in cloud sync.
 * - reminderId: which reminder; supports per-reminder history and aggregation.
 * - completedAt: when the user marked done (Unix ms); used for streaks and time-series.
 * - source: where it was marked (in-app vs notification); optional for analytics.
 * - occurrenceDate: local calendar day YYYY-MM-DD; optional, supports per-day queries and reporting.
 */
export interface Completion {
  id: string;
  reminderId: string;
  /** Unix ms when the user marked the reminder done (used for grouping by day). */
  completedAt: number;
  /** Where the completion was recorded. Omit for legacy records. */
  source?: CompletionSource;
  /** Local date YYYY-MM-DD for this occurrence; derived from completedAt if omitted. */
  occurrenceDate?: string;
}

/** Result of streak calculation for one reminder (no scheduling logic). */
export interface StreakResult {
  currentStreak: number;
  longestStreak: number;
}
