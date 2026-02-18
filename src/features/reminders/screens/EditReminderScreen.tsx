import React from 'react';
import { View } from 'react-native';
import { useReminderStore, useThemeColors } from '../../../core/store';
import { CreateReminderForm, reminderToFormValues, formValuesToReminderInput } from '../components/CreateReminderForm';
import type { CreateReminderFormValues } from '../components/CreateReminderForm';

interface EditReminderScreenProps {
  reminderId: string;
  onDone: () => void;
}

export function EditReminderScreen({ reminderId, onDone }: EditReminderScreenProps) {
  const reminders = useReminderStore((s) => s.reminders);
  const updateReminder = useReminderStore((s) => s.updateReminder);
  const colors = useThemeColors();

  const reminder = reminders.find((r) => r.id === reminderId);

  if (!reminder) {
    onDone();
    return null;
  }

  const initialValues: CreateReminderFormValues = reminderToFormValues(reminder);

  const handleSubmit = async (values: CreateReminderFormValues) => {
    await updateReminder(reminderId, formValuesToReminderInput(values));
    onDone();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <CreateReminderForm
        initialValues={initialValues}
        onSubmit={handleSubmit}
        onCancel={onDone}
        submitLabel="Save"
      />
    </View>
  );
}
