import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { RingtoneValue } from '../../../shared/types';
import { Button } from '../../../shared/components';
import { DEFAULT_RINGTONE } from '../../../core/constants';
import { useThemeColors } from '../../../core/store';
import { RingtonePicker } from './RingtonePicker';
import { getRingtoneLabel } from '../utils/ringtoneOptions';
import { SCHEDULE_KIND_OPTIONS } from '../utils/scheduleLabel';
import {
  type ScheduleFormValues,
  defaultScheduleFormValues,
  formValuesToSchedule,
  scheduleToFormValues,
} from '../utils/scheduleForm';
import { WEEKDAY_NAMES } from '../utils/scheduleLabel';

export interface CreateReminderFormValues {
  title: string;
  schedule: ScheduleFormValues;
  ringtone: RingtoneValue;
  enabled: boolean;
}

const defaultValues: CreateReminderFormValues = {
  title: '',
  schedule: defaultScheduleFormValues,
  ringtone: DEFAULT_RINGTONE,
  enabled: true,
};

interface CreateReminderFormProps {
  onSubmit: (values: CreateReminderFormValues) => void | Promise<void>;
  onCancel?: () => void;
  initialValues?: Partial<CreateReminderFormValues>;
  submitLabel?: string;
}

function addTimeSlot(times: string[], defaultTime: string = '09:00'): string[] {
  return [...times, defaultTime];
}

function removeTimeSlot(times: string[], index: number): string[] {
  if (times.length <= 1) return times;
  return times.filter((_, i) => i !== index);
}

function toggleWeekday(weekdays: number[], day: number): number[] {
  const set = new Set(weekdays);
  if (set.has(day)) {
    set.delete(day);
    const next = [...set].sort((a, b) => a - b);
    return next.length > 0 ? next : [day];
  }
  set.add(day);
  return [...set].sort((a, b) => a - b);
}

export function CreateReminderForm({
  onSubmit,
  onCancel,
  initialValues,
  submitLabel = 'Add reminder',
}: CreateReminderFormProps) {
  const colors = useThemeColors();
  const [values, setValues] = useState<CreateReminderFormValues>({
    ...defaultValues,
    ...initialValues,
  });
  const [submitting, setSubmitting] = useState(false);
  const schedule = values.schedule;

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1 },
        scrollContent: { padding: 16, paddingBottom: 32 },
        label: {
          fontSize: 14,
          fontWeight: '600',
          color: colors.textSecondary,
          marginBottom: 8,
          marginTop: 16,
        },
        input: {
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 16,
          color: colors.inputText,
          backgroundColor: colors.inputBg,
        },
        row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
        chip: {
          paddingVertical: 10,
          paddingHorizontal: 16,
          borderRadius: 10,
          backgroundColor: colors.chipBg,
        },
        chipActive: { backgroundColor: colors.chipBgActive },
        chipText: { fontSize: 14, fontWeight: '500', color: colors.chipText },
        chipTextActive: { color: colors.chipTextActive },
        timeRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          marginBottom: 8,
        },
        timeInput: {
          flex: 1,
          borderWidth: 1,
          borderColor: colors.inputBorder,
          borderRadius: 10,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontSize: 16,
          color: colors.inputText,
          backgroundColor: colors.inputBg,
        },
        smallButton: {
          paddingVertical: 10,
          paddingHorizontal: 14,
          borderRadius: 10,
          backgroundColor: colors.chipBg,
        },
        smallButtonText: { fontSize: 14, color: colors.primary, fontWeight: '600' },
        switchRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 20,
        },
        switchLabel: { fontSize: 16, color: colors.text },
        buttons: { marginTop: 28, gap: 12 },
        cancelButton: { marginTop: 8 },
      }),
    [colors]
  );

  const handleSubmit = async () => {
    const trimmed = values.title.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  };

  const setSchedule = (next: ScheduleFormValues) =>
    setValues((v) => ({ ...v, schedule: next }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Reminder name</Text>
        <TextInput
          style={styles.input}
          value={values.title}
          onChangeText={(t) => setValues((v) => ({ ...v, title: t }))}
          placeholder="e.g. Water, Walking break"
          placeholderTextColor={colors.placeholder}
          autoCapitalize="words"
        />

        <Text style={styles.label}>Schedule</Text>
        <View style={styles.row}>
          {SCHEDULE_KIND_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, schedule.scheduleKind === opt.value && styles.chipActive]}
              onPress={() => setSchedule({ ...schedule, scheduleKind: opt.value })}
            >
              <Text
                style={[
                  styles.chipText,
                  schedule.scheduleKind === opt.value && styles.chipTextActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {schedule.scheduleKind === 'interval' && (
          <>
            <Text style={styles.label}>Every</Text>
            <View style={[styles.row, { alignItems: 'center' }]}>
              <TextInput
                style={[styles.input, { minWidth: 72 }]}
                value={schedule.intervalValue}
                onChangeText={(t) =>
                  setSchedule({ ...schedule, intervalValue: t })
                }
                placeholder="30"
                placeholderTextColor={colors.placeholder}
                keyboardType="number-pad"
              />
              <View style={styles.row}>
                {(['minutes', 'hours'] as const).map((unit) => (
                  <TouchableOpacity
                    key={unit}
                    style={[
                      styles.chip,
                      schedule.intervalUnit === unit && styles.chipActive,
                    ]}
                    onPress={() => setSchedule({ ...schedule, intervalUnit: unit })}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        schedule.intervalUnit === unit && styles.chipTextActive,
                      ]}
                    >
                      {unit === 'hours' ? 'Hours' : 'Minutes'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}

        {schedule.scheduleKind === 'daily' && (
          <>
            <Text style={styles.label}>Time slots (24h)</Text>
            {schedule.dailyTimes.map((time, i) => (
              <View key={i} style={styles.timeRow}>
                <TextInput
                  style={styles.timeInput}
                  value={time}
                  onChangeText={(t) => {
                    const next = [...schedule.dailyTimes];
                    next[i] = t;
                    setSchedule({ ...schedule, dailyTimes: next });
                  }}
                  placeholder="09:00"
                  placeholderTextColor={colors.placeholder}
                />
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() =>
                    setSchedule({
                      ...schedule,
                      dailyTimes: removeTimeSlot(schedule.dailyTimes, i),
                    })
                  }
                  disabled={schedule.dailyTimes.length <= 1}
                >
                  <Text style={styles.smallButtonText}>−</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() =>
                setSchedule({
                  ...schedule,
                  dailyTimes: addTimeSlot(schedule.dailyTimes),
                })
              }
            >
              <Text style={styles.smallButtonText}>+ Add time</Text>
            </TouchableOpacity>
          </>
        )}

        {schedule.scheduleKind === 'weekly' && (
          <>
            <Text style={styles.label}>Weekdays</Text>
            <View style={styles.row}>
              {WEEKDAY_NAMES.map((name, i) => {
                const day = i + 1;
                const selected = schedule.weekdays.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.chip, selected && styles.chipActive]}
                    onPress={() =>
                      setSchedule({
                        ...schedule,
                        weekdays: toggleWeekday(schedule.weekdays, day),
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.chipText,
                        selected && styles.chipTextActive,
                      ]}
                    >
                      {name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.label, { marginTop: 8 }]}>Time slots (24h)</Text>
            {schedule.weeklyTimes.map((time, i) => (
              <View key={i} style={styles.timeRow}>
                <TextInput
                  style={styles.timeInput}
                  value={time}
                  onChangeText={(t) => {
                    const next = [...schedule.weeklyTimes];
                    next[i] = t;
                    setSchedule({ ...schedule, weeklyTimes: next });
                  }}
                  placeholder="09:00"
                  placeholderTextColor={colors.placeholder}
                />
                <TouchableOpacity
                  style={styles.smallButton}
                  onPress={() =>
                    setSchedule({
                      ...schedule,
                      weeklyTimes: removeTimeSlot(schedule.weeklyTimes, i),
                    })
                  }
                  disabled={schedule.weeklyTimes.length <= 1}
                >
                  <Text style={styles.smallButtonText}>−</Text>
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() =>
                setSchedule({
                  ...schedule,
                  weeklyTimes: addTimeSlot(schedule.weeklyTimes),
                })
              }
            >
              <Text style={styles.smallButtonText}>+ Add time</Text>
            </TouchableOpacity>
          </>
        )}

        <Text style={styles.label}>Ringtone</Text>
        <Text style={[styles.switchLabel, { marginBottom: 4 }]}>
          Current: {getRingtoneLabel(values.ringtone)}
        </Text>
        <RingtonePicker
          value={values.ringtone}
          onChange={(v) => setValues((prev) => ({ ...prev, ringtone: v }))}
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Enable immediately</Text>
          <Switch
            value={values.enabled}
            onValueChange={(v) =>
              setValues((prev) => ({ ...prev, enabled: v }))
            }
            trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
            thumbColor={values.enabled ? colors.switchThumbOn : colors.switchThumbOff}
          />
        </View>

        <View style={styles.buttons}>
          <Button
            title={submitLabel}
            onPress={handleSubmit}
            loading={submitting}
            disabled={!values.title.trim()}
          />
          {onCancel && (
            <Button
              title="Cancel"
              onPress={onCancel}
              variant="outline"
              style={styles.cancelButton}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Build CreateReminderFormValues from a Reminder (for edit screen). */
export function reminderToFormValues(reminder: {
  title: string;
  schedule: import('../../../shared/types').ScheduleConfig;
  ringtone: RingtoneValue;
  enabled: boolean;
}): CreateReminderFormValues {
  return {
    title: reminder.title,
    schedule: scheduleToFormValues(reminder.schedule),
    ringtone: reminder.ringtone,
    enabled: reminder.enabled,
  };
}

/** Build reminder create/update input from form values. */
export function formValuesToReminderInput(
  values: CreateReminderFormValues
): import('../../../shared/types').CreateReminderInput {
  return {
    title: values.title.trim(),
    schedule: formValuesToSchedule(values.schedule),
    ringtone: values.ringtone,
    enabled: values.enabled,
  };
}
