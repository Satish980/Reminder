import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColors } from '../../../core/store';
import { useStreakStore } from '../../../core/store';
import { getStatsSnapshot } from '../../../services/analytics.service';
import type { DayCount } from '../../../services/analytics.service';

const CHART_MAX_BAR_HEIGHT = 120;

function WeeklyChart({
  data,
  colors,
}: {
  data: DayCount[];
  colors: ReturnType<typeof useThemeColors>;
}) {
  const maxCount = Math.max(1, ...data.map((d) => d.count));
  const styles = useMemo(
    () =>
      StyleSheet.create({
        chartRow: {
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          height: CHART_MAX_BAR_HEIGHT + 44,
          paddingHorizontal: 4,
        },
        barWrap: { alignItems: 'center', flex: 1 },
        bar: {
          width: '70%',
          minHeight: 4,
          borderRadius: 6,
          backgroundColor: colors.primary,
          marginBottom: 6,
        },
        barLabel: { fontSize: 11, color: colors.textSecondary },
        barValue: { fontSize: 12, fontWeight: '600', color: colors.text, marginTop: 2 },
      }),
    [colors]
  );

  return (
    <View style={styles.chartRow}>
      {data.map((d) => (
        <View key={d.date} style={styles.barWrap}>
          <View
            style={[
              styles.bar,
              {
                height: Math.max(4, (d.count / maxCount) * CHART_MAX_BAR_HEIGHT),
                opacity: d.count > 0 ? 1 : 0.3,
              },
            ]}
          />
          <Text style={styles.barValue}>{d.count}</Text>
          <Text style={styles.barLabel} numberOfLines={1}>
            {d.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

interface StatisticsScreenProps {
  onClose?: () => void;
}

export function StatisticsScreen({ onClose }: StatisticsScreenProps) {
  const colors = useThemeColors();
  const completions = useStreakStore((s) => s.completions);

  const stats = useMemo(() => getStatsSnapshot(completions), [completions]);

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
        bigNumber: {
          fontSize: 36,
          fontWeight: '700',
          color: colors.primary,
        },
        bigLabel: {
          fontSize: 15,
          color: colors.textSecondary,
          marginTop: 4,
        },
        row: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
        },
        rowLabel: { fontSize: 15, color: colors.text },
        rowValue: { fontSize: 15, fontWeight: '600', color: colors.text },
      }),
    [colors]
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completion rate</Text>
          <Text style={styles.bigNumber}>{stats.completionPercentage}%</Text>
          <Text style={styles.bigLabel}>
            Days with at least one completion (last 7 days)
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Weekly trend</Text>
          <WeeklyChart data={stats.weeklyTrend} colors={colors} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Total completions</Text>
          <Text style={styles.bigNumber}>{stats.totalCompletions}</Text>
          <Text style={styles.bigLabel}>All time</Text>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>This week</Text>
            <Text style={styles.rowValue}>{stats.totalCompletionsThisWeek}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
