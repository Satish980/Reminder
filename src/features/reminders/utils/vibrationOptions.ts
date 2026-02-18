import type { VibrationPatternId } from '../../../shared/types';

export const VIBRATION_OPTIONS: { id: VibrationPatternId; label: string }[] = [
  { id: 'default', label: 'Default' },
  { id: 'strong', label: 'Strong' },
  { id: 'double', label: 'Double tap' },
  { id: 'none', label: 'None' },
];

export function getVibrationLabel(id: VibrationPatternId): string {
  return VIBRATION_OPTIONS.find((o) => o.id === id)?.label ?? id;
}
