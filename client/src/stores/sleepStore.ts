import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SleepRecord, SleepStats } from '@/types/sleep';
import { generateId, nowISO } from '@/lib/localDb';
import dayjs from 'dayjs';

export interface CreateSleepData {
  date: string;
  sleepTime: string;
  wakeTime?: string;
  quality?: 'GREAT' | 'GOOD' | 'FAIR' | 'POOR';
  notes?: string;
}

export interface UpdateSleepData {
  sleepTime?: string;
  wakeTime?: string;
  quality?: 'GREAT' | 'GOOD' | 'FAIR' | 'POOR';
  notes?: string;
}

function calculateDurationMinutes(sleepTime: string, wakeTime: string): number {
  const sleep = dayjs(sleepTime);
  const wake = dayjs(wakeTime);
  return Math.round(wake.diff(sleep, 'minute', true));
}

interface SleepState {
  records: SleepRecord[];
  loading: boolean;
  fetchRecords: (params?: { startDate?: string; endDate?: string; page?: number; pageSize?: number }) => Promise<void>;
  getRecordByDate: (date: string) => SleepRecord | undefined;
  getLatestRecord: () => SleepRecord | undefined;
  getStats: (startDate?: string, endDate?: string) => SleepStats;
  createRecord: (data: CreateSleepData) => Promise<SleepRecord>;
  updateRecord: (id: string, data: UpdateSleepData) => Promise<SleepRecord>;
  deleteRecord: (id: string) => Promise<void>;
}

export const useSleepStore = create<SleepState>()(
  persist(
    (set, get) => ({
      records: [],
      loading: false,

      fetchRecords: async (params) => {
        set({ loading: true });
        set({ loading: false });
      },

      getRecordByDate: (date: string) => {
        return get().records.find((r) => r.date === date);
      },

      getLatestRecord: () => {
        const sorted = [...get().records].sort((a, b) =>
          dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
        );
        return sorted[0];
      },

      getStats: (startDate?: string, endDate?: string) => {
        let records = [...get().records];

        if (startDate) {
          const start = dayjs(startDate);
          records = records.filter((r) => dayjs(r.date).isAfter(start) || dayjs(r.date).isSame(start));
        }
        if (endDate) {
          const end = dayjs(endDate);
          records = records.filter((r) => dayjs(r.date).isBefore(end) || dayjs(r.date).isSame(end));
        }

        const recordsWithDuration = records.filter((r) => r.durationMinutes && r.durationMinutes > 0);
        const totalDurationMinutes = recordsWithDuration.reduce((sum, r) => sum + (r.durationMinutes || 0), 0);
        const avgDurationMinutes =
          recordsWithDuration.length > 0 ? Math.round(totalDurationMinutes / recordsWithDuration.length) : 0;

        const qualityCounts: Record<string, number> = {
          GREAT: 0,
          GOOD: 0,
          FAIR: 0,
          POOR: 0,
        };
        records.forEach((r) => {
          if (r.quality) {
            qualityCounts[r.quality] = (qualityCounts[r.quality] || 0) + 1;
          }
        });

        const sortedRecords = [...records].sort((a, b) =>
          dayjs(b.date).valueOf() - dayjs(a.date).valueOf()
        );

        return {
          totalRecords: records.length,
          avgDurationMinutes,
          totalDurationMinutes,
          qualityCounts,
          records: sortedRecords,
        };
      },

      createRecord: async (data) => {
        const now = nowISO();
        let durationMinutes: number | undefined;
        if (data.wakeTime) {
          durationMinutes = calculateDurationMinutes(data.sleepTime, data.wakeTime);
        }

        const newRecord: SleepRecord = {
          id: generateId(),
          date: data.date,
          sleepTime: data.sleepTime,
          wakeTime: data.wakeTime,
          durationMinutes,
          quality: data.quality,
          notes: data.notes || '',
          createdAt: now,
          updatedAt: now,
        };

        set({ records: [newRecord, ...get().records] });
        return newRecord;
      },

      updateRecord: async (id, data) => {
        let updated: SleepRecord | undefined;
        set({
          records: get().records.map((r) => {
            if (r.id !== id) return r;
            const wakeTime = data.wakeTime !== undefined ? data.wakeTime : r.wakeTime;
            const sleepTime = data.sleepTime || r.sleepTime;
            let durationMinutes = r.durationMinutes;
            if (wakeTime && sleepTime) {
              durationMinutes = calculateDurationMinutes(sleepTime, wakeTime);
            }
            updated = {
              ...r,
              ...data,
              durationMinutes,
              updatedAt: nowISO(),
            };
            return updated;
          }),
        });
        if (!updated) throw new Error('Record not found');
        return updated;
      },

      deleteRecord: async (id) => {
        set({ records: get().records.filter((r) => r.id !== id) });
      },
    }),
    {
      name: 'focuslist-sleep',
    }
  )
);
