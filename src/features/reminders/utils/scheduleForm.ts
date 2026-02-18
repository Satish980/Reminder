/**
 * Maps between ScheduleConfig and form-friendly values for CreateReminderForm.
 */

import type { ScheduleConfig, ScheduleKind } from '../../../shared/types';

export interface ScheduleFormValues {
  scheduleKind: ScheduleKind;
  /** For interval */
  intervalValue: string;
  intervalUnit: 'minutes' | 'hours';
  /** For daily */
  dailyTimes: string[];
  /** For weekly */
  weekdays: number[];
  weeklyTimes: string[];
}

const DEFAULT_TIME = '09:00';

export const defaultScheduleFormValues: ScheduleFormValues = {
  scheduleKind: 'interval',
  intervalValue: '60',
  intervalUnit: 'minutes',
  dailyTimes: [DEFAULT_TIME],
  weekdays: [1],
  weeklyTimes: [DEFAULT_TIME],
};

export function scheduleToFormValues(schedule: ScheduleConfig): ScheduleFormValues {
  switch (schedule.kind) {
    case 'interval':
      return {
        ...defaultScheduleFormValues,
        scheduleKind: 'interval',
        intervalValue: String(schedule.value),
        intervalUnit: schedule.unit,
      };
    case 'daily':
      return {
        ...defaultScheduleFormValues,
        scheduleKind: 'daily',
        dailyTimes: schedule.times.length > 0 ? [...schedule.times] : [DEFAULT_TIME],
      };
    case 'weekly':
      return {
        ...defaultScheduleFormValues,
        scheduleKind: 'weekly',
        weekdays: schedule.weekdays.length > 0 ? [...schedule.weekdays] : [1],
        weeklyTimes: schedule.times.length > 0 ? [...schedule.times] : [DEFAULT_TIME],
      };
    default:
      return defaultScheduleFormValues;
  }
}

export function formValuesToSchedule(values: ScheduleFormValues): ScheduleConfig {
  switch (values.scheduleKind) {
    case 'interval': {
      const value = Math.max(1, parseInt(values.intervalValue, 10) || 60);
      return { kind: 'interval', value, unit: values.intervalUnit };
    }
    case 'daily': {
      const times = values.dailyTimes.filter((t) => t.trim().length > 0);
      return { kind: 'daily', times: times.length > 0 ? times : [DEFAULT_TIME] };
    }
    case 'weekly': {
      const weekdays = values.weekdays.length > 0 ? values.weekdays : [1];
      const times = values.weeklyTimes.filter((t) => t.trim().length > 0);
      return { kind: 'weekly', weekdays, times: times.length > 0 ? times : [DEFAULT_TIME] };
    }
    default:
      return { kind: 'interval', value: 60, unit: 'minutes' };
  }
}
