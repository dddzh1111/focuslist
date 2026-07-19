import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PomodoroPhase, PomodoroSettings, PomodoroRecord, PomodoroType } from '@/types/pomodoro';
import { DEFAULT_POMODORO_SETTINGS } from '@/types/pomodoro';
import { generateId, nowISO } from '@/lib/localDb';
import { useTaskStore } from './taskStore';

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
  pomodoros: PomodoroRecord[];

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

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
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
      pomodoros: [],

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

        if (newTimeLeft <= 0) {
          set({ isRunning: false });
          if (phase === 'focus') {
            get().completeSession().then(() => {
              get().skip();
              if (typeof window !== 'undefined') {
                if ('Notification' in window && Notification.permission === 'granted') {
                  new Notification('番茄完成！', { body: '专注阶段已完成，休息一下吧！' });
                }
              }
            });
          } else {
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

        const now = nowISO();
        const startTime = new Date(Date.now() - actualDuration * 1000).toISOString();

        const newPomodoro: PomodoroRecord = {
          id: generateId(),
          taskId: currentTaskId,
          startTime,
          endTime: now,
          duration: actualDuration,
          type: 'FOCUS' as PomodoroType,
          completed: true,
          interruptedAt: null,
          createdAt: now,
          userId: 'local',
        };

        set({ pomodoros: [newPomodoro, ...get().pomodoros] });

        const taskStore = useTaskStore.getState();
        const task = taskStore.tasks.find((t) => t.id === currentTaskId);
        if (task) {
          taskStore.updateTaskPomoStats(currentTaskId, actualDuration);
          if (!task.isLongTerm) {
            try {
              taskStore.updateStatus(currentTaskId, 'DONE');
            } catch {
              // ignore
            }
          }
        }
      },
    }),
    {
      name: 'focuslist-pomodoro',
      partialize: (state) => ({
        pomodoros: state.pomodoros,
        settings: state.settings,
      }),
    }
  )
);
