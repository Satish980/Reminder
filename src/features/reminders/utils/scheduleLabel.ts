/**
 * Human-readable labels for schedule configs. Options are data-driven (no hardcoded interval types in app logic).
 */

import type { ScheduleConfig, ScheduleKind } from '../../../shared/types';

export const SCHEDULE_KIND_OPTIONS: { value: ScheduleKind; label: string }[] = [
  { value: 'interval', label: 'Every X min/hours' },
  { value: 'daily', label: 'Daily at set times' },
  { value: 'weekly', label: 'Specific weekdays' },
];

const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getScheduleLabel(schedule: ScheduleConfig): string {
  switch (schedule.kind) {
    case 'interval':
      return schedule.unit === 'hours'
        ? `Every ${schedule.value} ${schedule.value === 1 ? 'hour' : 'hours'}`
        : `Every ${schedule.value} ${schedule.value === 1 ? 'minute' : 'min'}`;
    case 'daily':
      return schedule.times.length === 0
        ? 'Daily'
        : schedule.times.length === 1
          ? `Daily at ${schedule.times[0]}`
          : `Daily at ${schedule.times.join(', ')}`;
    case 'weekly':
      const dayStr =
        schedule.weekdays.length === 0
          ? 'Weekly'
          : schedule.weekdays
              .slice()
              .sort((a, b) => a - b)
              .map((d) => WEEKDAY_NAMES[d - 1])
              .join(', ');
      const timeStr =
        schedule.times.length === 1
          ? ` at ${schedule.times[0]}`
          : schedule.times.length > 1
            ? ` at ${schedule.times.join(', ')}`
            : '';
      return `${dayStr}${timeStr}`;
    default:
      return 'Scheduled';
  }
}

export function getWeekdayName(weekday: number): string {
  return WEEKDAY_NAMES[weekday - 1] ?? '';
}

export { WEEKDAY_NAMES };
