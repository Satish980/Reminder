# Reminder App

A React Native (Expo) reminder app built with TypeScript. Android-first, iOS-compatible. Supports local notifications with sound even when the app is closed.

## Features

- **Create reminders** with any name (e.g. water, walking, medication).
- **Flexible schedules**: every X minutes/hours, daily at set times, or specific weekdays with multiple time slots.
- **Local notifications** with sound; fire when the app is in background or closed.
- **Enable/disable** each reminder with a switch.
- **Edit and delete** reminders.
- **Snooze**: when a notification fires, snooze for 5 / 10 / 15 / 30 min (one-off only; future reminders unchanged). Snooze from notification actions (iOS) or in-app bar when opening from a tap (Android).
- **Completion tracking**: store completion status per occurrence (id, reminderId, completedAt, optional source, occurrenceDate). Mark done from in-app or from notification action ("Done" button). Schema supports history and analytics; streak logic unchanged.
- **Streak tracking**: completions drive current/longest streak per reminder (consecutive days). Data model is sync-friendly for future analytics/cloud.
- **Statistics screen**: completion percentage (days with ≥1 completion in last 7 days), weekly trend chart (completions per day), total completions (all time + this week). Modular **analytics.service** (pure functions) so new metrics can be added without touching UI.
- **Themes**: light, dark, and monochrome; selected via a single dropdown (default theme: dark).
- **Ringtone**: none, system default, or pick from device files / music library; in-app preview (Play button).
- **Per-reminder notification alerts**: each reminder can have its own **sound** (none / default; config abstracted for future expansion) and **vibration pattern** (default, strong, double tap, none). Android uses one notification channel per pattern so alerts differ per reminder; snoozed notifications keep the same sound/vibration.
- **Categories**: group reminders by category (e.g. Health, Fitness, Study). Categories are **user-defined** (no hardcoded types): add, edit, and delete from the **Categories** screen. New reminders can be assigned a category or left uncategorized. **Filter** the list by category (All / category chips). Deleting a category uncategorizes its reminders.
- **Test notification**: small “Test” control with bell icon in the list header (top right) to fire a sample notification in 3 seconds; only shown when notifications are available (not in Expo Go on Android).

## Architecture

The app uses a **feature-based** layout and keeps reminder logic separate from UI:

```
src/
├── app/                    # App shell
│   └── navigation/         # Root navigator and screens wiring
├── core/                   # Shared app core
│   ├── constants.ts       # Storage keys, notification channels, vibration patterns, defaults
│   ├── streaks/            # Pure streak calculation (no scheduling)
│   │   └── streakCalc.ts
│   └── store/              # Zustand stores (reminders, categories, theme, snooze, streaks)
├── features/
│   ├── reminders/          # Reminders feature
│   │   ├── components/     # ReminderCard, CreateReminderForm, RingtonePicker, SnoozeBar
│   │   ├── screens/        # List, Add, Edit, Categories
│   │   └── utils/          # scheduleLabel, scheduleForm, ringtoneOptions, vibrationOptions
│   └── statistics/         # Statistics feature
│       └── screens/        # StatisticsScreen (completion %, trend chart, totals)
├── services/               # Cross-cutting services
│   ├── analytics.service.ts    # Modular metrics (getTotalCompletions, getWeeklyTrend, etc.)
│   ├── storage.service.ts      # AsyncStorage persistence
│   ├── notification.service.ts # expo-notifications scheduling; per-reminder sound/vibration
│   ├── notificationChannels.ts # Android channels per vibration pattern (no circular deps)
│   ├── scheduleTriggerBuilder.ts # ScheduleConfig → notification triggers
│   ├── snooze.service.ts       # One-off snooze scheduling (uses alert config)
│   └── ringtone.service.ts    # Ringtone pick + preview (expo-audio)
└── shared/
    ├── components/         # Reusable UI (Button, Card)
    ├── types/              # Shared types (Reminder, Category, ScheduleConfig, Completion, etc.)
    └── migrateReminder.ts  # Raw storage → Reminder (schedule, ringtone, vibration, categoryId)
```

- **State**: Zustand store in `core/store` (reminders, categories, theme, snooze, streaks); persisted via `storage.service`.
- **Notifications**: Scheduled/cancelled in `notification.service`; per-reminder sound and vibration via `NotificationAlertConfig` and Android channels in `notificationChannels.ts`. Snooze uses the same alert config so snoozed notifications match the reminder’s sound/vibration.
- **No hardcoded schedule types**: Schedules are driven by `ScheduleConfig` (interval / daily / weekly); new kinds can be added in types, trigger builder, and form.
- **No hardcoded category types**: Categories are stored in `category.store`; seed names (e.g. Health, Fitness, Study) are used only when the list is empty. Filtering and assignment use `categoryId` only.

## Tech Stack

- **React Native** (Expo SDK 54) + **TypeScript**
- **Zustand** for state
- **AsyncStorage** for local persistence
- **expo-notifications** for local notifications (sound, repeat triggers)
- **React Navigation** (native stack) for list / add / edit flow

## Setup

1. **Node version**: This project needs **Node 20+** (Metro uses `Array.prototype.toReversed()`, which exists only in Node 20+). Use [nvm](https://github.com/nvm-sh/nvm) to switch:

   ```bash
   nvm install    # installs Node from .nvmrc (20)
   nvm use        # uses Node 20 in this directory
   ```

   Or from a different Node version already installed: `nvm use 20`.

2. Install dependencies (if not already):

   ```bash
   npm install
   ```

3. Run on Android (recommended) or iOS:

   ```bash
   npm run android
   # or
   npm run ios
   ```

## Install Reminder app on Android (after Android Studio is installed)

1. **Set Android SDK path** (if not already set). Android Studio usually installs the SDK at:
   - **macOS:** `~/Library/Android/sdk`
   - **Linux:** `~/Android/Sdk`
   - **Windows:** `%LOCALAPPDATA%\Android\Sdk`

   In a terminal (or add to `~/.zshrc` / `~/.bashrc`):

   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

   (On Linux use `$HOME/Android/Sdk`; on Windows set `ANDROID_HOME` in System Environment Variables.)

2. **Create an emulator** (if you don’t have a physical device): Open Android Studio → Device Manager → Create Device → pick a phone (e.g. Pixel 6) → Next → download a system image (e.g. API 34) → Finish. Start the emulator.

3. **From the project folder:**

   ```bash
   cd /path/to/Reminder
   nvm use
   npm install
   npx expo prebuild
   npx expo run:android
   ```

4. When the build finishes, the app installs and launches. To start the dev server later, run `npm start` and open the “Reminder” app on the device/emulator.

## Development build (for reminder notifications)

In **Expo Go**, reminder notifications don’t work on Android (SDK 53+). To get notifications (including when the app is closed), use a **development build**.

### Option A: Local build (Android)

**Prereqs:** Node 20 (`nvm use`), Android Studio with Android SDK, and a device/emulator.

1. Install the dev client and generate native projects:

   ```bash
   npx expo install expo-dev-client
   npx expo prebuild
   ```

2. Run the app (builds and installs the dev client):

   ```bash
   npx expo run:android
   ```

3. Start the dev server when prompted, or in another terminal:

   ```bash
   npm start
   ```

The installed app is your **custom dev build**. Open it; it will connect to the dev server and reminder notifications will work.

### Option B: Local build (iOS)

**Prereqs:** macOS, Xcode, Node 20.

```bash
npx expo install expo-dev-client
npx expo prebuild
npx expo run:ios
```

### Option C: EAS Build (cloud)

Use [EAS Build](https://docs.expo.dev/build/introduction/) to build in the cloud (no Android Studio/Xcode required):

1. Install EAS CLI and log in:

   ```bash
   npm install -g eas-cli
   eas login
   ```

2. Configure the project (first time):

   ```bash
   eas build:configure
   ```

3. Build a development client for Android:

   ```bash
   eas build --profile development --platform android
   ```

4. Download the APK from the link EAS gives you, install on your device, then run `npm start` and open the app so it connects to your dev server.

### After you have a dev build

- **Start JS dev server:** `npm start`
- **Open the dev-build app** on your device/emulator; it will load your app from the server.
- Reminder notifications (including when the app is closed) work in this build, not in Expo Go.

## Scripts

- `npm start` – Start Expo dev server (use with Expo Go or a dev build)
- `npm run android` – Build and run on Android (requires `expo prebuild` first)
- `npm run ios` – Build and run on iOS (requires `expo prebuild` first)

## Future Extensibility

The structure is set up so you can add:

- **New schedule kinds** (e.g. monthly): Extend `ScheduleConfig` in `shared/types`, add a branch in `scheduleTriggerBuilder.ts` and in `scheduleLabel.ts` / the form; no hardcoded interval types elsewhere.
- **Analytics / streaks**: New feature folder (e.g. `features/analytics` or `features/streaks`) and optional store slice; reminder store stays focused on CRUD and notifications.
- **Cloud sync**: Add a `sync.service` and optionally a `sync` slice in the store; persistence can be switched or layered (e.g. sync writes to AsyncStorage + remote).

For a full list of **next steps and feature ideas** (quick wins, medium effort, larger features, and suggested order), see **[docs/NEXT_STEPS_AND_FEATURES.md](docs/NEXT_STEPS_AND_FEATURES.md)**.

## Version history

| Version | Added | Removed / changed |
|--------|--------|-------------------|
| **1.0.0** | Reminders with name; intervals: hourly, daily, custom (minutes). Local notifications with sound. Enable/disable, edit, delete. Zustand + AsyncStorage persistence. React Navigation (list / add / edit). | — |
| **1.1.0** | Themes: light, dark, monochrome. Ringtone options: none, default, browse file, music library. Test notification. Lazy-loaded native modules for ringtone so app doesn’t crash if native build is stale. | — |
| **1.2.0** | Ringtone preview: “Play” button for custom/music library sounds. **expo-audio** for preview (replaces expo-av). Note in UI that custom sounds are preview-only; notifications use system default. | **expo-av** (deprecated; removed in favour of expo-audio). |
| **2.0.0** | **Schedule config**: no hardcoded interval types. **Custom intervals**: every X minutes or hours. **Daily**: multiple time slots per day (e.g. 09:00, 14:00). **Weekly**: choose weekdays (Sun–Sat) + multiple time slots. Configurable scheduler: one reminder can create multiple notifications (e.g. weekly = one per weekday×time). Migration from old `intervalType`/`dailyTime`/`customIntervalMinutes` to `schedule`. `scheduleTriggerBuilder` + cancel by identifier prefix for multi-slot reminders. | **Reminder shape**: `intervalType`, `customIntervalMinutes`, `dailyTime` replaced by single `schedule: ScheduleConfig`. **intervalLabel** replaced by **scheduleLabel** / **getScheduleLabel**. |
| **2.1.0** | **Snooze**: when a reminder notification fires, user can snooze for 5 / 10 / 15 / 30 min (configurable in `SNOOZE_DURATIONS_MINUTES`). Snooze schedules only a one-off notification; recurring schedule unchanged. Notification category with Snooze actions (iOS). In-app snooze bar when user opens app by tapping notification (Android fallback). `snooze.service` for scheduling; UI only dispatches. Cancelling a reminder also cancels its snoozed instances. | — |
| **2.2.0** | **Streak tracking**: completion history stored locally (`Completion`: id, reminderId, completedAt). "Mark done" on each reminder; pure streak calculation in `core/streaks/streakCalc` (current/longest consecutive days). Streak store persists completions; logic kept separate from reminder scheduling. Data model supports future analytics and cloud sync. Deleting a reminder clears its completions. | — |
| **2.3.0** | **Completion tracking**: `Completion` extended with optional `source` (in_app \| notification) and `occurrenceDate` (YYYY-MM-DD) for history and analytics. **Mark complete from notification**: "Done" action on reminder notifications (iOS); response listener records completion with source `notification`. **Statistics screen**: completion percentage (days with ≥1 completion in last 7), weekly trend bar chart (completions per day), total completions (all time + this week). **Modular analytics.service**: pure functions `getTotalCompletions`, `getWeeklyTrend`, `getCompletionPercentage`, `getStatsSnapshot`; add new metrics by adding functions. Navigation: Statistics screen; "Statistics" link on reminder list. | — |
| **2.4.0** | **Per-reminder notification sound and vibration**: each reminder has `ringtone` (unchanged) and `vibration` (default \| strong \| double \| none). Sound config abstracted as `NotificationSoundConfig`; alert config as `NotificationAlertConfig` for scheduling. Android: one notification channel per vibration pattern (`notificationChannels.ts`); snooze keeps reminder’s sound/vibration. **Theme**: single dropdown instead of three chips; default theme **dark**. **Test notification**: moved to small "Test" + bell icon in list header (top right). **Categories**: user-defined categories (add/edit/delete on Categories screen); reminders have `categoryId` (null = uncategorized). Filter list by category (All + category chips). Categories seeded with Health, Fitness, Study when empty; no hardcoded category types in logic. | Theme selector: three chips → one dropdown. Test notification: footer button → header link. |

_Current app version in `package.json`: **1.0.0**. Bump when you release (e.g. **2.4.0** categories, per-reminder alerts, theme dropdown, test-in-header)._

## Troubleshooting

- **"Cannot find native module"** — Rebuild the native app after adding packages: `npx expo prebuild --clean` then `npx expo run:android` (or `run:ios`). If you use Expo Go, switch to a [development build](#development-build-for-reminder-notifications) for features that need extra native modules (e.g. ringtone selection, notifications).
- More issues and fixes: **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)**.

## License

MIT
