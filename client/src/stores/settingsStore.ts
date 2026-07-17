import { create } from 'zustand';
import type { PomodoroSettings } from '@/types/pomodoro';
import { DEFAULT_POMODORO_SETTINGS } from '@/types/pomodoro';
import * as settingsApi from '@/api/settings';

interface SettingsState {
  settings: PomodoroSettings;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<PomodoroSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: { ...DEFAULT_POMODORO_SETTINGS },
  loading: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const response = await settingsApi.getSettings();
      set({ settings: response.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateSettings: async (data) => {
    try {
      const response = await settingsApi.updateSettings(data);
      set({ settings: response.data });
    } catch {
      // 本地乐观更新
      set({ settings: { ...get().settings, ...data } });
    }
  },
}));
