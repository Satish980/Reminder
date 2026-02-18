/**
 * Pure streak calculation from completion timestamps. No reminder scheduling,
 * no store, no I/O. Used by the streak store and safe for future analytics/sync.
 */

import type { StreakResult } from '../../shared/types';

/** Start of local calendar day (00:00:00) as date string YYYY-MM-DD for grouping. */
function toLocalDateKey(ms: number): string {
  const d = new Date(ms);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Compute current and longest streak from completion timestamps (Unix ms).
 * "Day" is the user's local calendar day; one completion per day counts.
 * Current streak: consecutive days ending at the most recent completion day
 * (counting backward from that day). Longest streak: max consecutive days ever.
 */
export function computeStreak(completedAtTimestamps: number[]): StreakResult {
  if (completedAtTimestamps.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const sortedDays = [...new Set(completedAtTimestamps.map(toLocalDateKey))].sort();
  if (sortedDays.length === 0) return { currentStreak: 0, longestStreak: 0 };

  let longestRun = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]).getTime();
    const curr = new Date(sortedDays[i]).getTime();
    const diffDays = Math.round((curr - prev) / (24 * 60 * 60 * 1000));
    if (diffDays === 1) {
      currentRun++;
    } else {
      longestRun = Math.max(longestRun, currentRun);
      currentRun = 1;
    }
  }
  longestRun = Math.max(longestRun, currentRun);

  const todayKey = toLocalDateKey(Date.now());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = toLocalDateKey(yesterday.getTime());

  let currentStreak = 0;
  if (sortedDays.length > 0) {
    const lastDay = sortedDays[sortedDays.length - 1];
    if (lastDay === todayKey || lastDay === yesterdayKey) {
      currentStreak = currentRun;
    }
  }

  return {
    currentStreak,
    longestStreak: longestRun,
  };
}
