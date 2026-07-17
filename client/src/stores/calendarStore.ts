import { create } from 'zustand';
import dayjs from 'dayjs';
import type { Task } from '@/types/task';
import * as calendarApi from '@/api/calendar';

type ViewMode = 'month' | 'week' | 'day';

interface CalendarState {
  viewMode: ViewMode;
  currentDate: string;
  tasksByDate: Record<string, Task[]>;
  loading: boolean;
  setViewMode: (mode: ViewMode) => void;
  setCurrentDate: (date: string) => void;
  goToToday: () => void;
  goToPrev: () => void;
  goToNext: () => void;
  fetchCalendarData: () => Promise<void>;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  viewMode: 'month',
  currentDate: dayjs().format('YYYY-MM-DD'),
  tasksByDate: {},
  loading: false,

  setViewMode: (mode) => {
    set({ viewMode: mode });
    get().fetchCalendarData();
  },

  setCurrentDate: (date) => {
    set({ currentDate: date });
    get().fetchCalendarData();
  },

  goToToday: () => {
    set({ currentDate: dayjs().format('YYYY-MM-DD') });
    get().fetchCalendarData();
  },

  goToPrev: () => {
    const { viewMode, currentDate } = get();
    const d = dayjs(currentDate);
    if (viewMode === 'month') {
      set({ currentDate: d.subtract(1, 'month').format('YYYY-MM-DD') });
    } else if (viewMode === 'week') {
      set({ currentDate: d.subtract(1, 'week').format('YYYY-MM-DD') });
    } else {
      set({ currentDate: d.subtract(1, 'day').format('YYYY-MM-DD') });
    }
    get().fetchCalendarData();
  },

  goToNext: () => {
    const { viewMode, currentDate } = get();
    const d = dayjs(currentDate);
    if (viewMode === 'month') {
      set({ currentDate: d.add(1, 'month').format('YYYY-MM-DD') });
    } else if (viewMode === 'week') {
      set({ currentDate: d.add(1, 'week').format('YYYY-MM-DD') });
    } else {
      set({ currentDate: d.add(1, 'day').format('YYYY-MM-DD') });
    }
    get().fetchCalendarData();
  },

  fetchCalendarData: async () => {
    const { viewMode, currentDate } = get();
    const d = dayjs(currentDate);

    let start: string;
    let end: string;

    if (viewMode === 'month') {
      start = d.startOf('month').startOf('week').format('YYYY-MM-DD');
      end = d.endOf('month').endOf('week').format('YYYY-MM-DD');
    } else if (viewMode === 'week') {
      start = d.startOf('week').format('YYYY-MM-DD');
      end = d.endOf('week').format('YYYY-MM-DD');
    } else {
      start = d.format('YYYY-MM-DD');
      end = d.format('YYYY-MM-DD');
    }

    set({ loading: true });
    try {
      const response = await calendarApi.getCalendarData(start, end);
      set({ tasksByDate: response.data, loading: false });
    } catch {
      set({ loading: false, tasksByDate: {} });
    }
  },
}));
