/**
 * Analytics dashboard. Read-only: reads completion history and current
 * reminders/categories to display metrics. No mutations; all logic in analytics service.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../core/store';
import { useStreakStore } from '../../../core/store';
import { useReminderStore } from '../../../core/store';
import { useCategoryStore } from '../../../core/store';
import {
  getCompletionDistributionByCategory,
  getWeeklyTrend,
  type CategoryDistributionSegment,
} from '../../../services/analytics.service';
import { DonutChart, assignSegmentColors } from '../components/DonutChart';
import { WeeklyTrendChart } from '../components/WeeklyTrendChart';

const WEEKLY_TREND_DAYS = 7;
const UNCATEGORIZED_LABEL = 'Uncategorized';

export interface AnalyticsDashboardScreenProps {
  onClose?: () => void;
}

export function AnalyticsDashboardScreen({ onClose }: AnalyticsDashboardScreenProps) {
  const colors = useThemeColors();

  // Read-only: history and lookup data from stores
  const completions = useStreakStore((s) => s.completions);
  const reminders = useReminderStore((s) => s.reminders);
  const categories = useCategoryStore((s) => s.categories);

  const reminderIdToCategoryId = useMemo(() => {
    const m = new Map<string, string | null>();
    for (const r of reminders) m.set(r.id, r.categoryId ?? null);
    return m;
  }, [reminders]);

  const categoryIdToName = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.id, c.name);
    return m;
  }, [categories]);

  const distribution = useMemo(
    () =>
      getCompletionDistributionByCategory(
        completions,
        reminderIdToCategoryId,
        categoryIdToName,
        UNCATEGORIZED_LABEL
      ),
    [completions, reminderIdToCategoryId, categoryIdToName]
  );

  const weeklyTrend = useMemo(
    () => getWeeklyTrend(completions, WEEKLY_TREND_DAYS),
    [completions]
  );

  const donutSegments = useMemo(() => {
    const palette = assignSegmentColors(distribution.length, [
      colors.primary,
      colors.textSecondary,
      colors.chipBgActive,
      colors.chipText,
      colors.border,
      colors.danger,
      colors.warningText,
    ]);
    return distribution.map((seg: CategoryDistributionSegment, i: number) => ({
      label: seg.categoryName,
      count: seg.count,
      color: palette[i],
    }));
  }, [distribution, colors]);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        scroll: { flex: 1 },
        content: { padding: 20, paddingBottom: 40 },
        section: {
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
          borderWidth: 1,
          borderColor: colors.border,
        },
        sectionTitle: {
          fontSize: 13,
          fontWeight: '600',
          color: colors.textSecondary,
          textTransform: 'uppercase',
          marginBottom: 12,
        },
      }),
    [colors]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completions by category</Text>
          <DonutChart segments={donutSegments} colors={colors} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Weekly completion trend (last {WEEKLY_TREND_DAYS} days)
          </Text>
          <WeeklyTrendChart data={weeklyTrend} colors={colors} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
