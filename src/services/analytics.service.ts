/**
 * Modular analytics service. Pure functions that take completions (and optional
 * reminders) and return metrics. No store or I/O; add new metrics by adding
 * new functions. Data can come from local store, sync, or tests.
 */

import type { Completion } from '../shared/types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toLocalDateKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getLastNDays(n: number): string[] {
  const out: string[] = [];
  const now = Date.now();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now - i * MS_PER_DAY);
    out.push(toLocalDateKey(d.getTime()));
  }
  return out;
}

/** Options for time-bounded metrics. */
export interface SinceOptions {
  /** Unix ms; only completions with completedAt >= since are included. */
  since?: number;
}

/**
 * Total number of completion events. Use options.since for "last 7 days" etc.
 */
export function getTotalCompletions(
  completions: Completion[],
  options?: SinceOptions
): number {
  if (!options?.since) return completions.length;
  return completions.filter((c) => c.completedAt >= options.since!).length;
}

/**
 * One data point per day for the last N days (default 7). Count of completions per day.
 * Dates are local YYYY-MM-DD; order is oldest to newest.
 */
export interface DayCount {
  date: string;
  label: string; // e.g. "Mon 12"
  count: number;
}

export function getWeeklyTrend(
  completions: Completion[],
  days: number = 7
): DayCount[] {
  const dates = getLastNDays(days);
  const countByDate = new Map<string, number>();
  for (const date of dates) countByDate.set(date, 0);

  const since = dates[0] ? new Date(dates[0]).getTime() : 0;
  for (const c of completions) {
    const key = c.occurrenceDate ?? toLocalDateKey(c.completedAt);
    if (countByDate.has(key)) countByDate.set(key, (countByDate.get(key) ?? 0) + 1);
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dates.map((date) => {
    const d = new Date(date);
    const label = `${dayLabels[d.getDay()]} ${d.getDate()}`;
    return { date, label, count: countByDate.get(date) ?? 0 };
  });
}

/**
 * Completion percentage: share of the last N days (default 7) where the user
 * had at least one completion. 0–100.
 */
export function getCompletionPercentage(
  completions: Completion[],
  days: number = 7
): number {
  if (days <= 0) return 0;
  const dates = getLastNDays(days);
  const since = new Date(dates[0]).getTime();
  const completedAtInRange = completions
    .filter((c) => c.completedAt >= since)
    .map((c) => c.occurrenceDate ?? toLocalDateKey(c.completedAt));
  const uniqueDays = new Set(completedAtInRange).size;
  return Math.round((uniqueDays / days) * 100);
}

/**
 * Aggregate metrics for the stats screen. Add more fields here and in the
 * service as needed for new metrics.
 */
export interface StatsSnapshot {
  totalCompletions: number;
  totalCompletionsThisWeek: number;
  completionPercentage: number;
  weeklyTrend: DayCount[];
}

export function getStatsSnapshot(completions: Completion[]): StatsSnapshot {
  const now = Date.now();
  const weekAgo = now - 7 * MS_PER_DAY;
  return {
    totalCompletions: getTotalCompletions(completions),
    totalCompletionsThisWeek: getTotalCompletions(completions, { since: weekAgo }),
    completionPercentage: getCompletionPercentage(completions, 7),
    weeklyTrend: getWeeklyTrend(completions, 7),
  };
}

/**
 * Completion distribution by category. Read-only: takes history (completions) and
 * lookup maps derived from current reminders/categories. No hardcoded category ids.
 */
export interface CategoryDistributionSegment {
  categoryId: string | null;
  categoryName: string;
  count: number;
}

export function getCompletionDistributionByCategory(
  completions: Completion[],
  reminderIdToCategoryId: Map<string, string | null>,
  categoryIdToName: Map<string, string>,
  uncategorizedLabel: string = 'Uncategorized'
): CategoryDistributionSegment[] {
  const countByCategoryId = new Map<string | null, number>();

  for (const c of completions) {
    const categoryId = reminderIdToCategoryId.get(c.reminderId) ?? null;
    countByCategoryId.set(categoryId, (countByCategoryId.get(categoryId) ?? 0) + 1);
  }

  const segments: CategoryDistributionSegment[] = [];
  for (const [categoryId, count] of countByCategoryId) {
    const categoryName =
      categoryId == null ? uncategorizedLabel : categoryIdToName.get(categoryId) ?? uncategorizedLabel;
    segments.push({ categoryId, categoryName, count });
  }
  segments.sort((a, b) => b.count - a.count);
  return segments;
}
