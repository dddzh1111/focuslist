import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PomodoroSettings } from '@/types/pomodoro';
import { DEFAULT_POMODORO_SETTINGS } from '@/types/pomodoro';

interface SettingsState {
  settings: PomodoroSettings;
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (data: Partial<PomodoroSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: { ...DEFAULT_POMODORO_SETTINGS },
      loading: false,

      fetchSettings: async () => {
        set({ loading: true });
        set({ loading: false });
      },

      updateSettings: async (data) => {
        set({ settings: { ...get().settings, ...data } });
      },
    }),
    {
      name: 'focuslist-settings',
    }
  )
);
