import { create } from 'zustand';
import type { PomodoroPhase, PomodoroSettings } from '@/types/pomodoro';
import { DEFAULT_POMODORO_SETTINGS } from '@/types/pomodoro';
import * as pomodoroApi from '@/api/pomodoros';
import * as taskApi from '@/api/tasks';

interface PomodoroState {
  currentTaskId: string | null;
  phase: PomodoroPhase;
  timeLeft: number;
  totalDuration: number;
  progress: number;
  isRunning: boolean;
  isPaused: boolean;
  currentSession: number;
  totalSessions: number;
  settings: PomodoroSettings;

  selectTask: (taskId: string | null, estimatedPomos?: number) => void;
  setPhase: (phase: PomodoroPhase) => void;
  start: () => void;
  pause: () => void;
  resume: () => void;
  tick: () => void;
  skip: () => void;
  stop: () => void;
  resetTimer: () => void;
  updateSettings: (s: Partial<PomodoroSettings>) => void;
  completeSession: () => Promise<void>;
}

export const usePomodoroStore = create<PomodoroState>((set, get) => ({
  currentTaskId: null,
  phase: 'idle',
  timeLeft: DEFAULT_POMODORO_SETTINGS.focusDuration * 60,
  totalDuration: DEFAULT_POMODORO_SETTINGS.focusDuration * 60,
  progress: 1,
  isRunning: false,
  isPaused: false,
  currentSession: 1,
  totalSessions: DEFAULT_POMODORO_SETTINGS.longBreakInterval,
  settings: { ...DEFAULT_POMODORO_SETTINGS },

  selectTask: (taskId, estimatedPomos) => {
    const { settings } = get();
    if (estimatedPomos && estimatedPomos > 0) {
      set({
        currentTaskId: taskId,
        totalSessions: estimatedPomos,
        currentSession: 1,
      });
    } else {
      set({
        currentTaskId: taskId,
        totalSessions: settings.longBreakInterval,
        currentSession: 1,
      });
    }
  },

  setPhase: (phase) => {
    const { settings } = get();
    let duration = settings.focusDuration * 60;
    if (phase === 'shortBreak') duration = settings.shortBreakDuration * 60;
    else if (phase === 'longBreak') duration = settings.longBreakDuration * 60;
    else if (phase === 'focus') duration = settings.focusDuration * 60;

    set({
      phase,
      timeLeft: duration,
      totalDuration: duration,
      progress: 1,
      isRunning: false,
      isPaused: false,
    });
  },

  start: () => set({ isRunning: true, isPaused: false }),
  pause: () => set({ isPaused: true, isRunning: false }),
  resume: () => set({ isPaused: false, isRunning: true }),

  tick: () => {
    const { timeLeft, isRunning, phase } = get();
    if (!isRunning || timeLeft <= 0) return;
    const newTimeLeft = timeLeft - 1;
    set({
      timeLeft: newTimeLeft,
      progress: newTimeLeft / get().totalDuration,
    });

    // 时间归零时自动完成当前阶段并切换
    if (newTimeLeft <= 0) {
      set({ isRunning: false });
      if (phase === 'focus') {
        // 专注阶段结束，保存记录并切换到休息
        get().completeSession().then(() => {
          // 自动切换到下一阶段
          get().skip();
          // 通知
          if (typeof window !== 'undefined') {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('番茄完成！', { body: '专注阶段已完成，休息一下吧！' });
            }
          }
        });
      } else {
        // 休息阶段结束，切换到专注
        get().skip();
        if (typeof window !== 'undefined') {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('休息结束！', { body: '开始新的专注吧！' });
          }
        }
      }
    }
  },

  skip: () => {
    const { phase, currentSession, totalSessions, settings } = get();
    let nextPhase: PomodoroPhase = 'idle';
    let nextSession = currentSession;

    if (phase === 'focus') {
      if (currentSession % totalSessions === 0) {
        nextPhase = 'longBreak';
      } else {
        nextPhase = 'shortBreak';
      }
    } else {
      nextPhase = 'focus';
      nextSession = currentSession + 1;
    }

    let duration = settings.focusDuration * 60;
    if (nextPhase === 'shortBreak') duration = settings.shortBreakDuration * 60;
    else if (nextPhase === 'longBreak') duration = settings.longBreakDuration * 60;

    set({
      phase: nextPhase,
      timeLeft: duration,
      totalDuration: duration,
      progress: 1,
      isRunning: false,
      isPaused: false,
      currentSession: nextSession,
    });
  },

  stop: () =>
    set({
      phase: 'idle',
      timeLeft: get().settings.focusDuration * 60,
      totalDuration: get().settings.focusDuration * 60,
      progress: 1,
      isRunning: false,
      isPaused: false,
      currentTaskId: null,
      currentSession: 1,
    }),

  resetTimer: () =>
    set({
      phase: 'idle',
      timeLeft: get().settings.focusDuration * 60,
      totalDuration: get().settings.focusDuration * 60,
      progress: 1,
      isRunning: false,
      isPaused: false,
    }),

  updateSettings: (s) =>
    set((state) => ({
      settings: { ...state.settings, ...s },
    })),

  completeSession: async () => {
    const { currentTaskId, phase, settings } = get();
    if (!currentTaskId || phase !== 'focus') return;

    const totalSec = settings.focusDuration * 60;
    const remaining = get().timeLeft;
    const actualDuration = totalSec - remaining;

    try {
      await pomodoroApi.createPomodoro({
        taskId: currentTaskId,
        startTime: new Date(Date.now() - actualDuration * 1000).toISOString(),
        endTime: new Date().toISOString(),
        duration: actualDuration,
        type: 'FOCUS',
        completed: true,
      });

      // 完成番茄后，尝试自动标记关联的短期任务为完成
      try {
        await taskApi.updateTaskStatus(currentTaskId, { status: 'DONE' });
      } catch {
        // 如果任务不是短期任务或状态更新失败，忽略
      }
    } catch (err) {
      console.error('保存番茄记录失败', err);
    }
  },
}));
