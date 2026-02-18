/**
 * Local notification service. Schedules and cancels notifications
 * so they fire even when the app is closed. Uses expo-notifications.
 * Scheduling is driven by ScheduleConfig (see scheduleTriggerBuilder); no hardcoded interval types.
 *
 * In Expo Go (SDK 53+), notification APIs are not available on Android;
 * we no-op so the app still runs and remind the user to use a dev build.
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Reminder } from '../shared/types';
import { NOTIFICATION_CHANNEL_ID, REMINDER_CATEGORY_ID, SNOOZE_DURATIONS_MINUTES, NOTIFICATION_ACTION_MARK_DONE } from '../core/constants';
import { buildTriggerSpecs } from './scheduleTriggerBuilder';
import { snoozePrefixForReminder } from './snooze.service';

/** Notifications are disabled in Expo Go (use a development build for reminders). */
export const isNotificationsUnavailable =
  Platform.OS === 'android' &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

if (!isNotificationsUnavailable) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Request permission for notifications. Call once at app start or before first schedule.
 * No-ops in Expo Go on Android (returns false).
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (isNotificationsUnavailable) return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Set up reminder notification category with Snooze action buttons (iOS).
 * Safe to call repeatedly. No-ops on Android / Expo Go (category is iOS-only in Expo).
 */
export async function setupReminderCategory(): Promise<void> {
  if (isNotificationsUnavailable) return;
  try {
    const actions: Notifications.NotificationAction[] = [
      {
        identifier: NOTIFICATION_ACTION_MARK_DONE,
        buttonTitle: 'Done',
        options: { opensAppToForeground: false },
      },
      ...SNOOZE_DURATIONS_MINUTES.map((mins) => ({
        identifier: `snooze_${mins}`,
        buttonTitle: `Snooze ${mins} min`,
        options: { opensAppToForeground: false } as const,
      })),
    ];
    await Notifications.setNotificationCategoryAsync(REMINDER_CATEGORY_ID, actions);
  } catch {
    // setNotificationCategoryAsync may be unavailable (e.g. web/Expo Go)
  }
}

/**
 * Create Android notification channel (required for sound on Android 8+).
 * Idempotent; safe to call on every launch. No-ops in Expo Go.
 */
export async function setupNotificationChannel(): Promise<void> {
  if (isNotificationsUnavailable || Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
}

function notificationIdentifier(reminderId: string, suffix: string): string {
  return suffix === '0' ? reminderId : `${reminderId}#${suffix}`;
}

/**
 * Schedule all notifications for a reminder from its schedule config.
 * One reminder may produce multiple scheduled notifications (e.g. weekly with several weekdays × times).
 */
export async function scheduleReminder(reminder: Reminder): Promise<void> {
  if (isNotificationsUnavailable || !reminder.enabled) return;

  await setupNotificationChannel();
  const channelId = Platform.OS === 'android' ? NOTIFICATION_CHANNEL_ID : undefined;
  const specs = buildTriggerSpecs(reminder.schedule, channelId);

  const sound =
    reminder.ringtone === 'none'
      ? undefined
      : 'default';

  await setupReminderCategory();

  const content: Notifications.NotificationContentInput = {
    title: reminder.title,
    body: `Time for: ${reminder.title}`,
    sound,
    data: { reminderId: reminder.id },
    categoryIdentifier: REMINDER_CATEGORY_ID,
  };

  for (const { identifierSuffix, trigger } of specs) {
    const identifier = notificationIdentifier(reminder.id, identifierSuffix);
    await Notifications.scheduleNotificationAsync({
      identifier,
      content,
      trigger,
    });
  }
}

/**
 * Cancel all scheduled notifications for a reminder so no duplicates or orphaned alarms remain.
 * Removes: recurring slots (reminderId, reminderId#1, …) and any snoozed instances (snooze:reminderId:*).
 * Call this before rescheduling on edit, and on delete, to keep notifications in sync with app state.
 */
export async function cancelReminderNotifications(reminderId: string): Promise<void> {
  if (isNotificationsUnavailable) return;
  const all = await Notifications.getAllScheduledNotificationsAsync();
  const snoozePrefix = snoozePrefixForReminder(reminderId);
  const toCancel = all.filter(
    (req) =>
      req.identifier === reminderId ||
      req.identifier.startsWith(reminderId + '#') ||
      req.identifier.startsWith(snoozePrefix)
  );
  for (const req of toCancel) {
    await Notifications.cancelScheduledNotificationAsync(req.identifier);
  }
}

/**
 * Cancel all scheduled notifications. Used when we need to resync (e.g. after
 * loading from storage we reschedule all enabled reminders). No-ops in Expo Go.
 */
export async function cancelAllScheduledNotifications(): Promise<void> {
  if (isNotificationsUnavailable) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

const TEST_NOTIFICATION_ID = 'reminder_test_sample';

/**
 * Schedule a one-off sample notification in 3 seconds. Useful for testing
 * that notifications work (sound, channel, etc.). No-ops in Expo Go.
 */
export async function scheduleTestNotification(): Promise<void> {
  if (isNotificationsUnavailable) return;
  await setupNotificationChannel();
  await Notifications.scheduleNotificationAsync({
    identifier: TEST_NOTIFICATION_ID,
    content: {
      title: 'Reminder (sample)',
      body: 'This is a test notification from the Reminder app.',
      sound: 'default',
      data: { test: true },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: 3,
      repeats: false,
      channelId: Platform.OS === 'android' ? NOTIFICATION_CHANNEL_ID : undefined,
    },
  });
}
