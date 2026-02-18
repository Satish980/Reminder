import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  ReminderListScreen,
  AddReminderScreen,
  EditReminderScreen,
  CategoriesScreen,
} from '../../features/reminders';
import { StatisticsScreen } from '../../features/statistics';
import { AnalyticsDashboardScreen } from '../../features/analytics'
import { useThemeStore, useThemeColors } from '../../core/store';

export type RootStackParamList = {
  ReminderList: undefined
  AddReminder: undefined
  EditReminder: { reminderId: string }
  Categories: undefined
  Statistics: undefined
  Analytics: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { mode } = useThemeStore();
  const colors = useThemeColors();

  const navTheme = {
    ...DefaultTheme,
    dark: mode === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.text,
      border: colors.border,
      notification: colors.primary,
    },
  };

  return (
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="ReminderList"
          component={ReminderListScreenWrapper}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="AddReminder"
          component={AddReminderScreenWrapper}
          options={{ title: 'New reminder', presentation: 'modal' }}
        />
        <Stack.Screen
          name="EditReminder"
          component={EditReminderScreenWrapper}
          options={{ title: 'Edit reminder' }}
        />
        <Stack.Screen
          name="Categories"
          component={CategoriesScreenWrapper}
          options={{ title: 'Categories' }}
        />
        <Stack.Screen
          name="Statistics"
          component={StatisticsScreenWrapper}
          options={{ title: 'Statistics' }}
        />
        <Stack.Screen
          name="Analytics"
          component={AnalyticsDashboardScreenWrapper}
          options={{ title: 'Analytics' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

function ReminderListScreenWrapper({
  navigation,
}: {
  navigation: { navigate: (name: string, params?: object) => void };
}) {
  return (
    <ReminderListScreen
      onAddPress={() => navigation.navigate('AddReminder')}
      onEditPress={(id) =>
        navigation.navigate('EditReminder', { reminderId: id })
      }
      onCategoriesPress={() => navigation.navigate('Categories')}
      onStatsPress={() => navigation.navigate('Statistics')}
      onAnalyticsPress={() => navigation.navigate('Analytics')}
    />
  )
}

function AddReminderScreenWrapper({
  navigation,
}: {
  navigation: { goBack: () => void };
}) {
  return <AddReminderScreen onDone={() => navigation.goBack()} />;
}

function EditReminderScreenWrapper({
  navigation,
  route,
}: {
  navigation: { goBack: () => void };
  route: { params: { reminderId: string } };
}) {
  return (
    <EditReminderScreen
      reminderId={route.params.reminderId}
      onDone={() => navigation.goBack()}
    />
  );
}

function CategoriesScreenWrapper({
  navigation,
}: {
  navigation: { goBack: () => void };
}) {
  return <CategoriesScreen onClose={() => navigation.goBack()} />;
}

function StatisticsScreenWrapper({
  navigation,
}: {
  navigation: { goBack: () => void };
}) {
  return <StatisticsScreen onClose={() => navigation.goBack()} />;
}

function AnalyticsDashboardScreenWrapper({
  navigation,
}: {
  navigation: { goBack: () => void }
}) {
  return <AnalyticsDashboardScreen onClose={() => navigation.goBack()} />
}
