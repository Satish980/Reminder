/**
 * Snooze service. Schedules a single one-off notification for a reminder
 * at (now + duration). Does not modify the reminder's recurring schedule;
 * only adds one extra notification. All scheduling logic lives here (no UI).
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { NotificationAlertConfig } from '../shared/types';
import { REMINDER_CATEGORY_ID } from '../core/constants';
import { getNotificationChannelId, ensureNotificationChannel } from './notificationChannels';

function isNotificationsUnavailable(): boolean {
  return (
    Platform.OS === 'android' &&
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
  );
}

const SNOOZE_ID_PREFIX = 'snooze:';

export function isSnoozeIdentifier(identifier: string): boolean {
  return identifier.startsWith(SNOOZE_ID_PREFIX);
}

/** Prefix for all snooze notification identifiers for a given reminder (for bulk cancel). */
export function snoozePrefixForReminder(reminderId: string): string {
  return `${SNOOZE_ID_PREFIX}${reminderId}:`;
}

/**
 * Build unique identifier for a snoozed notification so it never
 * conflicts with recurring reminder identifiers (reminderId or reminderId#n).
 */
function snoozeIdentifier(reminderId: string): string {
  return `${SNOOZE_ID_PREFIX}${reminderId}:${Date.now()}`;
}

/**
 * Schedule a one-off reminder notification to fire after `durationMinutes`.
 * Uses the reminder's alert config (sound + vibration) when provided.
 * No-op if notifications are unavailable (e.g. Expo Go on Android).
 */
export async function scheduleSnooze(
  reminderId: string,
  title: string,
  durationMinutes: number,
  alertConfig?: NotificationAlertConfig | null
): Promise<void> {
  if (isNotificationsUnavailable()) return;

  const vibration = alertConfig?.vibration ?? 'default';
  if (Platform.OS === 'android') {
    await ensureNotificationChannel(vibration);
  }
  const channelId = Platform.OS === 'android' ? getNotificationChannelId(vibration) : undefined;

  const sound =
    alertConfig?.sound.ringtone === 'none' ? undefined : 'default';

  const seconds = Math.max(1, Math.min(60 * 24, durationMinutes * 60)); // clamp 1 min – 24 h
  const identifier = snoozeIdentifier(reminderId);

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title,
      body: `Time for: ${title}`,
      sound,
      data: { reminderId },
      categoryIdentifier: REMINDER_CATEGORY_ID,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds,
      repeats: false,
      channelId,
    },
  });
}

/**
 * Parse action identifier from notification category (e.g. "snooze_10" -> 10).
 * Returns null if not a snooze action.
 */
export function parseSnoozeMinutesFromAction(actionIdentifier: string): number | null {
  if (!actionIdentifier.startsWith('snooze_')) return null;
  const minutes = parseInt(actionIdentifier.replace('snooze_', ''), 10);
  return Number.isNaN(minutes) || minutes < 1 ? null : minutes;
}
