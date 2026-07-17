import { get } from './client';
import type { ApiResponse } from '@/types/api';
import type { ListProgress } from '@/types/stats';

export interface OverviewStats {
  totalPomodoros: number;
  totalFocusSec: number;
  totalFocusHours: string;
  completedTasks: number;
  // 长期任务统计
  longTermTasks: number;
  longTermTotalChapters: number;
  longTermCompletedChapters: number;
  longTermProgress: number;
  // 短期任务统计
  completedShortTasks: number;
}

export interface DailyStatsItem {
  date: string;
  totalFocusSec: number;
  completedPomos: number;
  completedTasks: number;
  interruptedPomos: number;
}

export interface TaskStats {
  taskId: string;
  taskTitle: string;
  totalFocusSec: number;
  completedPomos: number;
}

export interface ListStats {
  listId: string;
  listName: string;
  totalFocusSec: number;
  completedPomos: number;
}

export interface TagStats {
  tag: string;
  totalFocusSec: number;
  completedPomos: number;
}

export function getOverview(): Promise<ApiResponse<OverviewStats>> {
  return get<OverviewStats>('/stats/overview');
}

export function getDaily(start?: string, end?: string): Promise<ApiResponse<DailyStatsItem[]>> {
  return get<DailyStatsItem[]>('/stats/daily', { start, end });
}

export function getByTask(start?: string, end?: string): Promise<ApiResponse<TaskStats[]>> {
  return get<TaskStats[]>('/stats/by-task', { start, end });
}

export function getByList(start?: string, end?: string): Promise<ApiResponse<ListStats[]>> {
  return get<ListStats[]>('/stats/by-list', { start, end });
}

export function getByTag(start?: string, end?: string): Promise<ApiResponse<TagStats[]>> {
  return get<TagStats[]>('/stats/by-tag', { start, end });
}

export function getListProgress(): Promise<ApiResponse<ListProgress[]>> {
  return get<ListProgress[]>('/stats/list-progress');
}

