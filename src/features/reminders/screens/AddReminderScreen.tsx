import React, { useEffect } from 'react';
import { View } from 'react-native';
import { useReminderStore, useThemeColors } from '../../../core/store';
import { CreateReminderForm, formValuesToReminderInput } from '../components/CreateReminderForm';
import type { CreateReminderFormValues } from '../components/CreateReminderForm';
import { requestNotificationPermissions } from '../../../services/notification.service';

interface AddReminderScreenProps {
  onDone: () => void;
}

export function AddReminderScreen({ onDone }: AddReminderScreenProps) {
  const addReminder = useReminderStore((s) => s.addReminder);
  const colors = useThemeColors();

  useEffect(() => {
    requestNotificationPermissions();
  }, []);

  const handleSubmit = async (values: CreateReminderFormValues) => {
    await addReminder(formValuesToReminderInput(values));
    onDone();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <CreateReminderForm
        onSubmit={handleSubmit}
        onCancel={onDone}
        submitLabel="Add reminder"
      />
    </View>
  );
}
