import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { RootNavigator } from './src/app/navigation/RootNavigator';
import { useThemeStore, useSnoozeStore, useStreakStore, useCategoryStore } from './src/core/store';
import { NOTIFICATION_ACTION_MARK_DONE } from './src/core/constants';
import { scheduleSnooze, parseSnoozeMinutesFromAction } from './src/services/snooze.service';

/**
 * App entry: providers + root navigation.
 * Theme is hydrated here so it's ready before first paint.
 * Notification response (e.g. Snooze action) is handled here; scheduling stays in snooze.service.
 */
export default function App() {
  const { mode, hydrate } = useThemeStore();
  const setPendingSnooze = useSnoozeStore((s) => s.setPendingSnooze);
  const hydrateCategories = useCategoryStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);
  useEffect(() => {
    hydrateCategories();
  }, [hydrateCategories]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const { actionIdentifier } = response;
      const content = response.notification.request.content;
      const data = (content.data || {}) as { reminderId?: string };
      const reminderId = data.reminderId;
      const title = content.title || 'Reminder';

      if (actionIdentifier === NOTIFICATION_ACTION_MARK_DONE && reminderId) {
        useStreakStore.getState().addCompletion(reminderId, 'notification');
        return;
      }
      const snoozeMinutes = parseSnoozeMinutesFromAction(actionIdentifier);
      if (snoozeMinutes !== null && reminderId) {
        scheduleSnooze(reminderId, title, snoozeMinutes);
        return;
      }
      if (actionIdentifier === Notifications.DEFAULT_ACTION_IDENTIFIER && reminderId) {
        setPendingSnooze({ reminderId, title });
      }
    });
    return () => sub.remove();
  }, [setPendingSnooze]);

  const statusBarStyle = mode === 'dark' ? 'light' : 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar style={statusBarStyle} />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
