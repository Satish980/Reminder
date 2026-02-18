# Troubleshooting

## "Cannot find native module" / "Native module cannot be null"

This usually means the app binary was built **before** some native dependencies were added, or you're using **Expo Go** which doesn't include every native module.

### Fix: Rebuild the native app

If you're using a **development build** (not Expo Go):

1. Clean and regenerate native projects:
   ```bash
   npx expo prebuild --clean
   ```

2. Build and run again:
   ```bash
   npx expo run:android
   # or
   npx expo run:ios
   ```

This links the new native modules (e.g. `expo-document-picker`, `expo-media-library`, `expo-av` for ringtone selection) into your app.

### If you're using Expo Go

Expo Go only includes a fixed set of native modules. Features that use extra native code (e.g. **ringtone selection** from device/music library, **reminder notifications** on Android) need a **development build**. Create one:

```bash
npx expo install expo-dev-client
npx expo prebuild
npx expo run:android
```

Then use the installed "Reminder" app instead of Expo Go.

### Ringtone picker still shows "No audio" or "Browse" does nothing

- The ringtone feature uses **lazy-loaded** native modules. If the native module isn't available, the app won't crash; "Browse audio file" and "Music library" will just return no results.
- Rebuild the app as above so the native modules are included. After a clean prebuild and run, device audio and file picker should work.

---

## Notifications not firing (Android)

- **Expo Go on Android (SDK 53+)** does not support reminder notifications. Use a development build.
- Ensure notification **permission** is granted (first time you add a reminder or tap "Test notification").
- For scheduled notifications when the app is **closed**, you must use a **development build**; Expo Go cannot run background notification logic.

---

## Metro / Node version errors

- **`TypeError: configs.toReversed is not a function`** — You're on Node 18 or lower. Metro (used by Expo) requires **Node 20+**. Switch and try again:
  ```bash
  nvm use
  # or, if Node 20 isn't installed:
  nvm install 20
  nvm use 20
  npm start
  # or
  npx expo run:android
  ```
- Always run `nvm use` in the project folder before `npm start` or `expo run:android` so the dev server (Metro) uses Node 20.

---

## Theme / "regular of undefined" (React Navigation)

- If you see `Cannot read property 'regular' of undefined` from React Navigation, the navigation theme must include the full default theme (including `fonts`). The app spreads `DefaultTheme` in `RootNavigator`; ensure that code wasn’t removed.

---

## Android: configureCMakeDebug failed / "File was modified during checks"

Error like:
```text
Execution failed for task ':app:configureCMakeDebug[arm64-v8a]'.
File '...' was modified during checks for C/C++ configuration invalidation.
```
This is a known CMake/Gradle cache bug ([Google 255965912](https://issuetracker.google.com/255965912)). Clean native caches and rebuild:

**Option A – Clean and rebuild (keep existing `android/`):**
```bash
cd android
./gradlew clean
rm -rf app/.cxx build app/build
cd ..
npx expo run:android
```

**Option B – Full reset (regenerate `android/`):**
```bash
rm -rf android
npx expo prebuild
npx expo run:android
```

Use Option B if Option A doesn’t fix it.

---

## Android SDK / ANDROID_HOME not found

- Set the Android SDK path and add platform-tools to `PATH`:
  ```bash
  export ANDROID_HOME=$HOME/Library/Android/sdk   # macOS
  export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools
  ```
- On Linux use `$HOME/Android/Sdk`; on Windows set `ANDROID_HOME` in System Environment Variables.
