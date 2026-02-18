import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useThemeColors } from '../../../core/store';
import {
  RINGTONE_BUILTIN,
  getRingtoneLabel,
} from '../utils/ringtoneOptions';
import type { RingtoneValue } from '../../../shared/types';
import {
  pickAudioFile,
  getDeviceAudioAssets,
  toStoredCustomUri,
  previewRingtoneByUri,
  stopPreview,
  getCustomRingtoneUri,
  requestMediaLibraryPermission,
} from '../../../services/ringtone.service';

interface RingtonePickerProps {
  value: RingtoneValue;
  onChange: (value: RingtoneValue) => void;
}

export function RingtonePicker({ value, onChange }: RingtonePickerProps) {
  const colors = useThemeColors();
  const [deviceAudio, setDeviceAudio] = useState<{ id: string; uri: string; filename: string }[]>([]);
  const [loadingDevice, setLoadingDevice] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        sectionTitle: {
          fontSize: 12,
          fontWeight: '600',
          color: colors.textSecondary,
          marginTop: 16,
          marginBottom: 8,
          textTransform: 'uppercase',
        },
        row: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingVertical: 12,
          paddingHorizontal: 4,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        rowLast: { borderBottomWidth: 0 },
        label: { fontSize: 16, color: colors.text, flex: 1 },
        check: { fontSize: 14, color: colors.primary, fontWeight: '600' },
        browse: {
          paddingVertical: 12,
          paddingHorizontal: 16,
          borderRadius: 10,
          backgroundColor: colors.chipBg,
          marginTop: 8,
        },
        browseText: { fontSize: 15, color: colors.primary, fontWeight: '500' },
        previewText: { fontSize: 13, color: colors.textSecondary, marginLeft: 8 },
        playButton: {
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: colors.chipBg,
          marginLeft: 8,
        },
        playButtonText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
        list: { maxHeight: 200 },
        loading: { paddingVertical: 12, alignSelf: 'center' },
      }),
    [colors]
  );

  const loadDeviceAudio = async () => {
    setLoadingDevice(true);
    try {
      const granted = await requestMediaLibraryPermission();
      if (!granted) {
        Alert.alert(
          'Permission needed',
          'Allow access to media library to choose from your music.',
          [{ text: 'OK' }]
        );
        setDeviceAudio([]);
        return;
      }
      const assets = await getDeviceAudioAssets(40);
      setDeviceAudio(assets.map((a) => ({ id: a.id, uri: a.uri, filename: a.filename })));
    } catch {
      setDeviceAudio([]);
    } finally {
      setLoadingDevice(false);
    }
  };

  useEffect(() => {
    loadDeviceAudio();
    return () => {
      stopPreview();
    };
  }, []);

  const handleSelectBuiltin = (id: RingtoneValue) => {
    stopPreview();
    onChange(id);
  };

  const handlePickFile = async () => {
    const result = await pickAudioFile();
    if (result) {
      onChange(toStoredCustomUri(result.uri));
    }
  };

  const handleSelectDeviceAudio = (uri: string) => {
    onChange(toStoredCustomUri(uri));
  };

  const handlePreview = (uri: string) => {
    previewRingtoneByUri(uri);
  };

  const customUri = getCustomRingtoneUri(value);

  return (
    <View>
      <Text style={styles.sectionTitle}>App & system</Text>
      {RINGTONE_BUILTIN.map((opt) => (
        <TouchableOpacity
          key={opt.id}
          style={styles.row}
          onPress={() => handleSelectBuiltin(opt.id)}
        >
          <Text style={styles.label}>{opt.label}</Text>
          {value === opt.id && <Text style={styles.check}>✓</Text>}
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>From device</Text>
      <Text style={[styles.previewText, { marginBottom: 4 }]}>
        Custom sounds play in preview only; notifications use the system default sound.
      </Text>
      <TouchableOpacity style={styles.browse} onPress={handlePickFile}>
        <Text style={styles.browseText}>Browse audio file…</Text>
      </TouchableOpacity>
      {customUri && value.startsWith('custom:') && !deviceAudio.some((a) => a.uri === customUri) && (
        <View style={[styles.row, styles.rowLast, { flexDirection: 'row', alignItems: 'center' }]}>
          <Text style={styles.label} numberOfLines={1}>
            {getRingtoneLabel(value)}
          </Text>
          <TouchableOpacity style={styles.playButton} onPress={() => handlePreview(customUri)}>
            <Text style={styles.playButtonText}>Play</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Music library</Text>
      {loadingDevice ? (
        <ActivityIndicator style={styles.loading} color={colors.primary} />
      ) : (
        <ScrollView style={styles.list} nestedScrollEnabled>
          {deviceAudio.map((a) => {
            const stored = toStoredCustomUri(a.uri);
            const isSelected = value === stored;
            return (
              <View key={a.id} style={[styles.row, { flexDirection: 'row', alignItems: 'center' }]}>
                <TouchableOpacity
                  style={{ flex: 1 }}
                  onPress={() => handleSelectDeviceAudio(a.uri)}
                >
                  <Text style={styles.label} numberOfLines={1}>
                    {a.filename || 'Audio'}
                  </Text>
                </TouchableOpacity>
                {isSelected && <Text style={styles.check}>✓</Text>}
                <TouchableOpacity style={styles.playButton} onPress={() => handlePreview(a.uri)}>
                  <Text style={styles.playButtonText}>Play</Text>
                </TouchableOpacity>
              </View>
            );
          })}
          {deviceAudio.length === 0 && !loadingDevice && (
            <Text style={[styles.label, { paddingVertical: 8 }]}>
              No audio in library, or grant permission.
            </Text>
          )}
        </ScrollView>
      )}
    </View>
  );
}
