/**
 * Builds expo-notifications trigger inputs from ScheduleConfig.
 * Configurable and scalable: no hardcoded interval types; add new schedule kinds
 * by extending ScheduleConfig and adding a branch here.
 */

import * as Notifications from 'expo-notifications';
import type { ScheduleConfig } from '../shared/types';

const T = Notifications.SchedulableTriggerInputTypes;

export interface TriggerSpec {
  /** Suffix for notification identifier: reminderId + (suffix ? '#' + suffix : '') */
  identifierSuffix: string;
  trigger: Notifications.NotificationTriggerInput;
}

const MIN_INTERVAL_SECONDS = 60;

/**
 * Parses "HH:mm" to { hour, minute }. Defaults to 9:00 if invalid.
 */
function parseTime(time: string): { hour: number; minute: number } {
  const parts = (time ?? '09:00').trim().split(':');
  const hour = Math.min(23, Math.max(0, parseInt(parts[0], 10) || 9));
  const minute = Math.min(59, Math.max(0, parseInt(parts[1], 10) || 0));
  return { hour, minute };
}

/**
 * Builds one or more trigger specs from a schedule config.
 * Each spec has a unique identifierSuffix so one reminder can have multiple scheduled notifications.
 */
export function buildTriggerSpecs(
  schedule: ScheduleConfig,
  channelId: string | undefined
): TriggerSpec[] {
  const channel = channelId ? { channelId } : {};

  switch (schedule.kind) {
    case 'interval': {
      const seconds =
        schedule.unit === 'hours'
          ? Math.max(MIN_INTERVAL_SECONDS, schedule.value * 3600)
          : Math.max(MIN_INTERVAL_SECONDS, schedule.value * 60);
      return [
        {
          identifierSuffix: '0',
          trigger: {
            type: T.TIME_INTERVAL,
            seconds,
            repeats: true,
            ...channel,
          },
        },
      ];
    }

    case 'daily': {
      const times = schedule.times.length > 0 ? schedule.times : ['09:00'];
      return times.map((time, i) => {
        const { hour, minute } = parseTime(time);
        return {
          identifierSuffix: String(i),
          trigger: {
            type: T.DAILY,
            hour,
            minute,
            ...channel,
          },
        };
      });
    }

    case 'weekly': {
      const weekdays = schedule.weekdays.length > 0 ? schedule.weekdays : [1];
      const times = schedule.times.length > 0 ? schedule.times : ['09:00'];
      const specs: TriggerSpec[] = [];
      let idx = 0;
      for (const weekday of weekdays) {
        for (const time of times) {
          const { hour, minute } = parseTime(time);
          specs.push({
            identifierSuffix: String(idx++),
            trigger: {
              type: T.WEEKLY,
              weekday,
              hour,
              minute,
              ...channel,
            },
          });
        }
      }
      return specs;
    }

    default:
      return [
        {
          identifierSuffix: '0',
          trigger: {
            type: T.TIME_INTERVAL,
            seconds: 3600,
            repeats: true,
            ...channel,
          },
        },
      ];
  }
}
