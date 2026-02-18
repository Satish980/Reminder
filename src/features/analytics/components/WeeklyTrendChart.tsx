import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { DayCount } from '../../../services/analytics.service';

const CHART_MAX_BAR_HEIGHT = 120;

interface WeeklyTrendChartProps {
  data: DayCount[];
  colors: { primary: string; text: string; textSecondary: string };
}

/** Weekly completion trend: bar chart. Data and time range come from analytics service (no hardcoding). */
export function WeeklyTrendChart({ data, colors }: WeeklyTrendChartProps) {
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
