/**
 * Android notification channel helpers. One channel per vibration pattern
 * so per-reminder sound/vibration can be applied. No dependency on snooze or reminder types.
 */

import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { VibrationPatternId } from '../shared/types';
import { NOTIFICATION_CHANNEL_ID, VIBRATION_PATTERNS } from '../core/constants';

const isUnavailable =
  Platform.OS === 'android' &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

export function getNotificationChannelId(vibration: VibrationPatternId): string {
  return `${NOTIFICATION_CHANNEL_ID}-${vibration}`;
}

const channelSetupDone = new Set<string>();

export async function ensureNotificationChannel(vibration: VibrationPatternId): Promise<void> {
  if (isUnavailable || Platform.OS !== 'android') return;
  const channelId = getNotificationChannelId(vibration);
  if (channelSetupDone.has(channelId)) return;
  const pattern = VIBRATION_PATTERNS[vibration];
  await Notifications.setNotificationChannelAsync(channelId, {
    name: `Reminders${vibration === 'default' ? '' : ` (${vibration})`}`,
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
    vibrationPattern: pattern.length > 0 ? pattern : undefined,
  });
  channelSetupDone.add(channelId);
}

export async function setupAllNotificationChannels(): Promise<void> {
  if (isUnavailable || Platform.OS !== 'android') return;
  const patterns = ['default', 'strong', 'double', 'none'] as const;
  for (const v of patterns) {
    await ensureNotificationChannel(v);
  }
}
