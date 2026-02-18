/**
 * Local persistence service. Abstracts AsyncStorage so we can swap
 * implementation (e.g. for future cloud sync or encrypted storage).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const getItem = async <T>(key: string): Promise<T | null> => {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw == null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const setItem = async <T>(key: string, value: T): Promise<void> => {
  await AsyncStorage.setItem(key, JSON.stringify(value));
};

const removeItem = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(key);
};

export const storageService = {
  getItem,
  setItem,
  removeItem,
};
