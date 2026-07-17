export type PomodoroType = 'FOCUS' | 'SHORT_BREAK' | 'LONG_BREAK';
export type PomodoroPhase = 'idle' | 'focus' | 'shortBreak' | 'longBreak';

export interface PomodoroRecord {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  type: PomodoroType;
  completed: boolean;
  interruptedAt: string | null;
  createdAt: string;
  taskId: string;
  userId: string;
}

export interface CreatePomodoroInput {
  taskId: string;
  startTime: string;
  endTime: string;
  duration: number;
  type: PomodoroType;
  completed: boolean;
}

export interface PomodoroSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreak: boolean;
  autoStartFocus: boolean;
  whiteNoise: string;
  volume: number;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  longBreakInterval: 4,
  autoStartBreak: false,
  autoStartFocus: false,
  whiteNoise: 'none',
  volume: 80,
};
