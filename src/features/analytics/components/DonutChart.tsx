import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

export interface DonutSegment {
  label: string;
  count: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  strokeWidth?: number;
  colors: { text: string; textSecondary: string };
}

const DEFAULT_PALETTE = [
  '#2563eb',
  '#64748b',
  '#0d9488',
  '#ca8a04',
  '#c026d3',
  '#dc2626',
  '#65a30d',
];

/** Donut chart: segments update dynamically from data. No hardcoded categories. */
export function DonutChart({
  segments,
  size = 160,
  strokeWidth = 20,
  colors,
}: DonutChartProps) {
  const total = useMemo(
    () => segments.reduce((s, seg) => s + seg.count, 0),
    [segments]
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        wrap: { alignItems: 'center', marginVertical: 8 },
        svgWrap: { transform: [{ rotate: '-90deg' }] },
        legend: { marginTop: 16, width: '100%', maxWidth: 220 },
        legendRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 6,
        },
        legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
        legendLabel: { fontSize: 13, color: colors.text, flex: 1 },
        legendValue: { fontSize: 13, fontWeight: '600', color: colors.text },
      }),
    [colors]
  );

  const radius = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  if (segments.length === 0 || total === 0) {
    return (
      <View style={styles.wrap}>
        <View style={[styles.svgWrap, { width: size, height: size }]}>
          <Svg width={size} height={size}>
            <Circle
              cx={cx}
              cy={cy}
              r={radius}
              fill="transparent"
              stroke={colors.textSecondary}
              strokeWidth={strokeWidth}
              opacity={0.3}
            />
          </Svg>
        </View>
        <Text style={[styles.legendLabel, { marginTop: 12, color: colors.textSecondary }]}>
          No completion data yet
        </Text>
      </View>
    );
  }

  let offset = 0;
  const circles = segments.map((seg, i) => {
    const fraction = seg.count / total;
    const segmentLength = fraction * circumference;
    const rotation = (offset / circumference) * 360;
    offset += segmentLength;
    return (
      <G key={i} transform={`rotate(${rotation}, ${cx}, ${cy})`}>
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="transparent"
          stroke={seg.color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${segmentLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
        />
      </G>
    );
  });

  return (
    <View style={styles.wrap}>
      <View style={[styles.svgWrap, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="transparent"
            stroke={colors.textSecondary}
            strokeWidth={strokeWidth}
            opacity={0.15}
          />
          {circles}
        </Svg>
      </View>
      <View style={styles.legend}>
        {segments.map((seg, i) => (
          <View key={i} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: seg.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>
              {seg.label}
            </Text>
            <Text style={styles.legendValue}>
              {seg.count} ({total > 0 ? Math.round((seg.count / total) * 100) : 0}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Assign colors to distribution segments from a palette (no hardcoded category colors). */
export function assignSegmentColors(
  segmentCount: number,
  palette: string[] = DEFAULT_PALETTE
): string[] {
  const out: string[] = [];
  for (let i = 0; i < segmentCount; i++) out.push(palette[i % palette.length]);
  return out;
}
