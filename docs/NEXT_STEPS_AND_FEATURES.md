# Next Steps & Feature Ideas

This doc outlines possible next steps and features you can add to the Reminder app, grouped by focus and effort.

---

## Quick wins (1–2 days)

| Feature | Description | Where to add |
|--------|-------------|--------------|
| **Weekly interval** | Repeat reminder on specific weekdays (e.g. every Mon, Wed, Fri). | Extend `ReminderIntervalType` in `shared/types`, add trigger in `notification.service`, option in `CreateReminderForm` and `intervalLabel.ts`. |
| **Snooze** | Snooze a notification for 5/10/15 min from the notification action. | Handle notification response in `notification.service`, reschedule with delay; optional `snoozeMinutes` in reminder type. |
| **Reminder reorder** | Drag to reorder reminders in the list. | Add `order: number` to `Reminder`, use `react-native-draggable-flatlist` or similar; persist in store. |
| **Default time for daily** | Prefill “daily” reminder with a sensible default (e.g. 09:00). | Already supported; optionally add app-level default in `core/constants` or a small settings screen. |
| **Haptic feedback** | Light haptic on toggle / add / delete. | Use `expo-haptics` in `ReminderCard` and list actions. |

---

## Medium effort (3–7 days)

| Feature | Description | Where to add |
|--------|-------------|--------------|
| **Streaks** | Track consecutive days (or intervals) a reminder was “done” (e.g. user dismisses or marks done). | New `features/streaks`: store completion timestamps per reminder, compute streak in a util; show on `ReminderCard` or detail screen. |
| **Reminder detail screen** | Tap a reminder to see details, next fire time, streak, history. | New screen in `features/reminders/screens`, navigate from `ReminderCard`; use `getNextTriggerDateAsync` from expo-notifications for “next at”. |
| **Categories / tags** | Group reminders (e.g. Health, Work). | Add optional `categoryId` to `Reminder`, new `features/categories` or simple tag strings; filter/sort list by category. |
| **Custom notification sound** | Let user pick a sound per reminder (from a small set). | Add `soundId` to `Reminder`; in `notification.service` use different sound; ensure Android resource names are valid (no `default`). |
| **Widget (Android / iOS)** | Home screen widget showing next reminders or quick-add. | Expo: consider `expo-widget-kit` or custom native widget; new `widget/` or `app-widget` config. |
| **Onboarding** | First-launch flow: permissions, sample reminder, theme pick. | New `features/onboarding` screen(s), show once (flag in AsyncStorage), then navigate to main list. |
| **Backup / export** | Export reminders as JSON file; optional import. | New `features/settings` or `services/backup.service`; read/write store JSON via share or file picker. |

---

## Larger features (1–2+ weeks)

| Feature | Description | Where to add |
|--------|-------------|--------------|
| **Cloud sync** | Sync reminders across devices (e.g. Firebase, Supabase, or your backend). | New `services/sync.service`; store keeps local source of truth, sync layer pushes/pulls; conflict resolution (last-write or merge). |
| **Analytics / stats** | Charts: completions per day, streak history, most-used reminders. | New `features/analytics` with a simple chart library (e.g. `react-native-chart-kit`); data from completion/streak store. |
| **Smart scheduling** | “Remind me when I’m likely free” or “don’t remind between 10pm–7am”. | Add quiet hours / preferences to reminder or app settings; in `notification.service` skip or reschedule if in quiet window. |
| **Recurrence rules** | Rich rules: “every 2nd Tuesday”, “weekdays only”, “last day of month”. | Extend `Reminder` with a recurrence model (or reuse a small rule engine); map to expo-notifications calendar triggers. |
| **Wear OS / Apple Watch** | Companion app or complications for next reminder. | Separate target or Expo config for wear; shared logic via API or sync. |
| **Accessibility** | Screen reader labels, larger touch targets, reduced motion. | Audit `shared/components` and screens; add `accessibilityLabel`, `accessibilityHint`; respect system “reduce motion” in animations. |

---

## Technical / quality improvements

| Area | Suggestion |
|------|------------|
| **Testing** | Add Jest + React Native Testing Library; unit tests for store, `intervalLabel`, notification trigger builder; one or two screen tests. |
| **Error boundaries** | Wrap navigator or main screens in an error boundary; show a fallback UI and optional report. |
| **Offline / errors** | If you add sync, handle offline: queue changes, retry, show “pending sync” in UI. |
| **Performance** | Virtualize long lists (already using FlatList); avoid heavy work on main thread in notification scheduling. |
| **Security** | If storing sensitive reminder text in cloud, encrypt at rest; use secure storage for tokens (e.g. `expo-secure-store`). |

---

## Suggested order to tackle

1. **Weekly interval** – High value, fits current architecture.
2. **Streaks** – Differentiates the app and reuses existing reminder model.
3. **Reminder detail + next fire time** – Improves clarity without big infra.
4. **Onboarding** – Better first-run experience.
5. **Backup / export** – User-visible safety net before adding sync.
6. **Cloud sync** – Once you’re happy with local behavior and data shape.

Use this as a living doc: tick off what you ship and add new ideas as you go.
