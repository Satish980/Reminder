import type { RingtoneId, RingtoneValue } from '../../../shared/types';
import { getCustomRingtoneDisplayName, isCustomRingtone } from '../../../services/ringtone.service';

export const RINGTONE_BUILTIN: { id: RingtoneId; label: string }[] = [
  { id: 'none', label: 'None (silent)' },
  { id: 'default', label: 'System default' },
];

export function getRingtoneLabel(value: RingtoneValue): string {
  if (isCustomRingtone(value)) return getCustomRingtoneDisplayName(value);
  const builtin = RINGTONE_BUILTIN.find((o) => o.id === value);
  return builtin?.label ?? value;
}
