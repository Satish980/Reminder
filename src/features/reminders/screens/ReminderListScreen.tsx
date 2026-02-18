import React, { useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import {
  useReminderStore,
  useThemeStore,
  useThemeColors,
  useStreakStore,
} from '../../../core/store'
import type { ColorMode } from '../../../core/theme'
import { ReminderCard } from '../components/ReminderCard'
import { SnoozeBar } from '../components/SnoozeBar'
import { Button } from '../../../shared/components'
import Ionicons from '@expo/vector-icons/Ionicons'
import {
  isNotificationsUnavailable,
  requestNotificationPermissions,
  scheduleTestNotification,
} from '../../../services/notification.service'

export interface ReminderListScreenProps {
  onAddPress: () => void
  onEditPress: (id: string) => void
  onStatsPress?: () => void
}

const MODE_LABELS: Record<ColorMode, string> = {
  light: 'Light',
  dark: 'Dark',
  monochrome: 'Monochrome',
}

export function ReminderListScreen({
  onAddPress,
  onEditPress,
  onStatsPress,
}: ReminderListScreenProps) {
  const { reminders, hydrated, hydrate, setEnabled, removeReminder } =
    useReminderStore()
  const { mode, setMode } = useThemeStore()
  const addCompletion = useStreakStore((s) => s.addCompletion)
  const clearCompletionsForReminder = useStreakStore(
    (s) => s.clearCompletionsForReminder
  )
  const colors = useThemeColors()

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        centered: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        },
        loadingText: { fontSize: 16, color: colors.textSecondary },
        header: {
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 8,
        },
        title: {
          fontSize: 28,
          fontWeight: '700',
          color: colors.text,
        },
        subtitle: {
          fontSize: 15,
          color: colors.textSecondary,
          marginTop: 4,
        },
        headerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          marginTop: 12,
          gap: 8,
        },
        themeRow: {
          flexDirection: 'row',
          gap: 8,
        },
        topLink: {
          paddingVertical: 6,
          paddingHorizontal: 12,
        },
        topLinkText: {
          fontSize: 15,
          fontWeight: '500',
          color: colors.primary,
        },
        topLinkRow: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        themeDropdown: {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: colors.chipBg,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        themeDropdownText: {
          fontSize: 13,
          fontWeight: '500',
          color: colors.chipText,
        },
        modalOverlay: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)',
        },
        modalContent: {
          backgroundColor: colors.background,
          borderRadius: 12,
          minWidth: 160,
          paddingVertical: 4,
        },
        themeOption: {
          paddingVertical: 12,
          paddingHorizontal: 16,
        },
        themeOptionText: {
          fontSize: 15,
          fontWeight: '500',
          color: colors.text,
        },
        themeOptionTextActive: {
          color: colors.primary,
        },
        expoGoBanner: {
          backgroundColor: colors.warningBg,
          paddingVertical: 10,
          paddingHorizontal: 16,
          marginHorizontal: 20,
          marginBottom: 8,
          borderRadius: 8,
        },
        expoGoBannerText: {
          fontSize: 13,
          color: colors.warningText,
        },
        list: {
          padding: 16,
          paddingBottom: 100,
        },
        cardWrap: { marginBottom: 12 },
        empty: {
          paddingVertical: 40,
          alignItems: 'center',
        },
        emptyText: { fontSize: 17, color: colors.textSecondary },
        emptyHint: {
          fontSize: 14,
          color: colors.textSecondary,
          marginTop: 8,
          opacity: 0.9,
        },
        footer: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          paddingBottom: 32,
          backgroundColor: colors.background,
        },
      }),
    [colors]
  )

  const streakHydrate = useStreakStore((s) => s.hydrate)
  const [themePickerVisible, setThemePickerVisible] = useState(false)

  useEffect(() => {
    hydrate()
    streakHydrate()
  }, [hydrate, streakHydrate])

  const handleTestNotification = async () => {
    const granted = await requestNotificationPermissions()
    if (!granted) {
      Alert.alert(
        'Permission needed',
        'Allow notifications in Settings to test.',
        [{ text: 'OK' }]
      )
      return
    }
    await scheduleTestNotification()
    Alert.alert(
      'Test scheduled',
      'A sample notification will appear in 3 seconds.'
    )
  }

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete reminder',
      'Are you sure you want to remove this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await clearCompletionsForReminder(id)
            await removeReminder(id)
          },
        },
      ]
    )
  }

  if (!hydrated) {
    return (
      <SafeAreaView style={styles.centered} edges={['top']}>
        <Text style={styles.loadingText}>Loading…</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Reminders</Text>
        <Text style={styles.subtitle}>
          {reminders.length === 0
            ? 'No reminders yet'
            : `${reminders.length} reminder${
                reminders.length === 1 ? '' : 's'
              }`}
        </Text>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.themeDropdown}
            onPress={() => setThemePickerVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.themeDropdownText}>{MODE_LABELS[mode]}</Text>
            <Text style={styles.themeDropdownText}>▾</Text>
          </TouchableOpacity>
          <View style={styles.themeRow}>
            {onStatsPress && (
              <TouchableOpacity style={styles.topLink} onPress={onStatsPress}>
                <Text style={styles.topLinkText}>Statistics</Text>
              </TouchableOpacity>
            )}
            {!isNotificationsUnavailable && (
              <TouchableOpacity
                style={styles.topLink}
                onPress={handleTestNotification}
              >
                <View style={styles.topLinkRow}>
                  <Text style={styles.topLinkText}>Test</Text>
                  <Ionicons
                    name="notifications"
                    size={16}
                    color={colors.primary}
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <Modal
        visible={themePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setThemePickerVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setThemePickerVisible(false)}
        >
          <Pressable
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {(['light', 'dark', 'monochrome'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={styles.themeOption}
                onPress={() => {
                  setMode(m)
                  setThemePickerVisible(false)
                }}
              >
                <Text
                  style={[
                    styles.themeOptionText,
                    mode === m && styles.themeOptionTextActive,
                  ]}
                >
                  {MODE_LABELS[m]}
                </Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {isNotificationsUnavailable && (
        <View style={styles.expoGoBanner}>
          <Text style={styles.expoGoBannerText}>
            Using Expo Go — reminder notifications need a development build.
          </Text>
        </View>
      )}

      <SnoozeBar />

      <FlatList
        data={reminders}
        keyExtractor={(r) => r.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Add a reminder to get started</Text>
            <Text style={styles.emptyHint}>
              e.g. water, walking, or any habit you want to track
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <ReminderCard
              reminder={item}
              onToggle={setEnabled}
              onMarkDone={addCompletion}
              onEdit={onEditPress}
              onDelete={handleDelete}
            />
          </View>
        )}
      />

      <View style={styles.footer}>
        <Button title="Add reminder" onPress={onAddPress} />
      </View>
    </SafeAreaView>
  )
}
