/**
 * Ringtone selection: system/default, and device audio (files + media library).
 * Custom URIs are stored as "custom:<uri>". In-app preview uses expo-audio;
 * notification sound is always system default (expo-notifications only supports
 * bundled resource names, not device file URIs).
 *
 * Native modules (expo-document-picker, expo-media-library, expo-audio) are
 * loaded lazily so the app doesn't crash if the native app wasn't rebuilt.
 */

import type { RingtoneValue } from '../shared/types';

const CUSTOM_PREFIX = 'custom:';
const PLAYBACK_STATUS_UPDATE = 'playbackStatusUpdate';

export function isCustomRingtone(value: RingtoneValue): value is string {
  return typeof value === 'string' && value.startsWith(CUSTOM_PREFIX);
}

export function getCustomRingtoneUri(value: RingtoneValue): string | null {
  if (!isCustomRingtone(value)) return null;
  return value.slice(CUSTOM_PREFIX.length);
}

export function toStoredCustomUri(uri: string): string {
  return `${CUSTOM_PREFIX}${uri}`;
}

/** Pick an audio file from the device (files app / downloads). Returns null if cancelled or if native module is unavailable. */
export async function pickAudioFile(): Promise<{ uri: string; name: string } | null> {
  try {
    const DocumentPicker = await import('expo-document-picker');
    const result = await DocumentPicker.getDocumentAsync({
      type: 'audio/*',
      copyToCacheDirectory: true,
    });
    if (result.canceled) return null;
    const file = result.assets[0];
    return { uri: file.uri, name: file.name ?? 'Audio file' };
  } catch {
    return null;
  }
}

export interface MediaLibraryAudio {
  id: string;
  uri: string;
  filename: string;
  duration: number;
}

/** Request media library permission. Returns false if denied or if native module is unavailable. */
export async function requestMediaLibraryPermission(): Promise<boolean> {
  try {
    const MediaLibrary = await import('expo-media-library');
    const { status } = await MediaLibrary.requestPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}

/** Get audio assets from device media library. Returns [] if permission denied or native module unavailable. */
export async function getDeviceAudioAssets(
  limit: number = 50
): Promise<MediaLibraryAudio[]> {
  try {
    const MediaLibrary = await import('expo-media-library');
    const granted = await requestMediaLibraryPermission();
    if (!granted) return [];

    const { assets } = await MediaLibrary.getAssetsAsync({
      mediaType: MediaLibrary.MediaType.audio,
      first: limit,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
    });

    return assets.map((a) => ({
      id: a.id,
      uri: a.uri,
      filename: a.filename,
      duration: a.duration ?? 0,
    }));
  } catch {
    return [];
  }
}

/** Get display name for a custom ringtone (filename from URI or "Custom sound"). */
export function getCustomRingtoneDisplayName(value: RingtoneValue): string {
  const uri = getCustomRingtoneUri(value);
  if (!uri) return 'Custom sound';
  const parts = uri.split('/');
  const last = parts[parts.length - 1];
  return last && last.length < 40 ? last : 'Custom sound';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let previewPlayer: { remove: () => void; play: () => void; addListener: (event: string, cb: (s: { didJustFinish?: boolean }) => void) => { remove: () => void } } | null = null;
let previewSubscription: { remove: () => void } | null = null;

/** Preview a ringtone by URI. Stops any current preview. No-op if native module unavailable. */
export async function previewRingtoneByUri(uri: string): Promise<void> {
  try {
    const { createAudioPlayer, setAudioModeAsync } = await import('expo-audio');

    if (previewPlayer) {
      previewSubscription?.remove();
      previewPlayer.remove();
      previewPlayer = null;
      previewSubscription = null;
    }

    await setAudioModeAsync({ playsInSilentMode: true });

    const player = createAudioPlayer(uri, { updateInterval: 200 });
    previewPlayer = player;

    const sub = player.addListener(PLAYBACK_STATUS_UPDATE, (status: { didJustFinish?: boolean }) => {
      if (status.didJustFinish) {
        sub?.remove();
        player.remove();
        if (previewPlayer === player) {
          previewPlayer = null;
          previewSubscription = null;
        }
      }
    });
    previewSubscription = sub;

    player.play();
  } catch (_err) {
    // Native module missing, unsupported format, or invalid URI
  }
}

/** Stop any playing preview. */
export async function stopPreview(): Promise<void> {
  if (previewPlayer) {
    try {
      previewSubscription?.remove();
      previewPlayer.remove();
    } catch {}
    previewPlayer = null;
    previewSubscription = null;
  }
}
