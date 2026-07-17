export interface UserSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  whiteNoise: 'none' | 'rain' | 'forest' | 'cafe';
  volume: number;
}

export const DEFAULT_SETTINGS: UserSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreak: false,
  autoStartFocus: false,
  whiteNoise: 'none',
  volume: 80,
};
