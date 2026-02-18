import React, { useMemo } from 'react';
import { View, Text, Switch, StyleSheet, TouchableOpacity } from 'react-native';
import type { Reminder } from '../../../shared/types';
import { Card } from '../../../shared/components';
import { getScheduleLabel } from '../utils/scheduleLabel';
import { getRingtoneLabel } from '../utils/ringtoneOptions';
import { getVibrationLabel } from '../utils/vibrationOptions';
import { useThemeColors, useStreakStore, useCategoryStore } from '../../../core/store';
import { computeStreak } from '../../../core/streaks/streakCalc';

interface ReminderCardProps {
  reminder: Reminder;
  onToggle: (id: string, enabled: boolean) => void;
  onMarkDone?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function ReminderCard({ reminder, onToggle, onMarkDone, onEdit, onDelete }: ReminderCardProps) {
  const colors = useThemeColors();
  const categories = useCategoryStore((s) => s.categories);
  const completions = useStreakStore((s) => s.completions);
  const categoryName =
    reminder.categoryId != null
      ? categories.find((c) => c.id === reminder.categoryId)?.name
      : null;
  const streak = useMemo(
    () =>
      computeStreak(
        completions.filter((c) => c.reminderId === reminder.id).map((c) => c.completedAt)
      ),
    [completions, reminder.id]
  );
  const styles = useMemo(
    () =>
      StyleSheet.create({
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        content: { flex: 1, marginRight: 12 },
        title: {
          fontSize: 17,
          fontWeight: '600',
          color: colors.text,
        },
        subtitle: {
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 4,
        },
        actions: {
          flexDirection: 'row',
          gap: 16,
          marginTop: 12,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        actionText: {
          fontSize: 14,
          color: colors.primary,
          fontWeight: '500',
        },
        deleteText: { color: colors.danger },
        streakText: { fontSize: 13, color: colors.primary, marginTop: 2 },
        doneButton: {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: colors.chipBg,
          marginRight: 8,
        },
        doneButtonText: { fontSize: 13, fontWeight: '600', color: colors.primary },
      }),
    [colors]
  );

  const scheduleLabel = getScheduleLabel(reminder.schedule);
  const streakLabel =
    streak.currentStreak > 0 || streak.longestStreak > 0
      ? streak.currentStreak > 0
        ? `🔥 ${streak.currentStreak} day streak${streak.longestStreak > streak.currentStreak ? ` · Best ${streak.longestStreak}` : ''}`
        : `Best: ${streak.longestStreak} days`
      : null;

  return (
    <Card>
      <View style={styles.row}>
        <View style={styles.content}>
          <Text style={styles.title}>{reminder.title}</Text>
          <Text style={styles.subtitle}>
            {scheduleLabel}
            {categoryName != null ? ` · ${categoryName}` : ''}
            {reminder.ringtone !== 'none' ? ` · ${getRingtoneLabel(reminder.ringtone)}` : ' · Silent'}
            {reminder.vibration && reminder.vibration !== 'default'
              ? ` · ${getVibrationLabel(reminder.vibration)}`
              : ''}
          </Text>
          {streakLabel !== null && (
            <Text style={styles.streakText}>{streakLabel}</Text>
          )}
        </View>
        {onMarkDone && (
          <TouchableOpacity style={styles.doneButton} onPress={() => onMarkDone(reminder.id)}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        )}
        <Switch
          value={reminder.enabled}
          onValueChange={(v) => onToggle(reminder.id, v)}
          trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
          thumbColor={reminder.enabled ? colors.switchThumbOn : colors.switchThumbOff}
        />
      </View>
      {(onEdit || onDelete) && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity onPress={() => onEdit(reminder.id)}>
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={() => onDelete(reminder.id)}>
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Card>
  );
}
