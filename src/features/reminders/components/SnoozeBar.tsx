import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useSnoozeStore, useThemeColors, useReminderStore } from '../../../core/store';
import { SNOOZE_DURATIONS_MINUTES } from '../../../core/constants';
import { scheduleSnooze } from '../../../services/snooze.service';
import { getAlertConfigFromReminder } from '../../../services/notification.service';

/**
 * In-app snooze prompt when user opened the app by tapping a reminder notification
 * (e.g. on Android where notification action buttons may not be available).
 * Dispatches to snooze.service; no scheduling logic here.
 */
export function SnoozeBar() {
  const pendingSnooze = useSnoozeStore((s) => s.pendingSnooze);
  const clearPendingSnooze = useSnoozeStore((s) => s.clearPendingSnooze);
  const reminders = useReminderStore((s) => s.reminders);
  const colors = useThemeColors();

  const alertConfig = pendingSnooze
    ? (() => {
        const r = reminders.find((x) => x.id === pendingSnooze.reminderId);
        return r ? getAlertConfigFromReminder(r) : null;
      })()
    : null;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bar: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          paddingVertical: 10,
          paddingHorizontal: 16,
          marginHorizontal: 16,
          marginBottom: 8,
          borderRadius: 10,
          backgroundColor: colors.chipBg,
        },
        title: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.text,
          flex: 1,
        },
        row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
        btn: {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: colors.background,
        },
        btnText: { fontSize: 13, fontWeight: '600', color: colors.primary },
        dismiss: { paddingVertical: 6, paddingHorizontal: 10 },
        dismissText: { fontSize: 13, color: colors.textSecondary },
      }),
    [colors]
  );

  if (!pendingSnooze) return null;

  const handleSnooze = (minutes: number) => {
    scheduleSnooze(pendingSnooze.reminderId, pendingSnooze.title, minutes, alertConfig ?? undefined);
    clearPendingSnooze();
  };

  return (
    <View style={styles.bar}>
      <Text style={styles.title} numberOfLines={1}>
        Snooze "{pendingSnooze.title}"?
      </Text>
      <View style={styles.row}>
        {SNOOZE_DURATIONS_MINUTES.map((mins) => (
          <TouchableOpacity
            key={mins}
            style={styles.btn}
            onPress={() => handleSnooze(mins)}
          >
            <Text style={styles.btnText}>{mins} min</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.dismiss} onPress={clearPendingSnooze}>
          <Text style={styles.dismissText}>Dismiss</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
