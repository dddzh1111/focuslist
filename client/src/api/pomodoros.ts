import { get, post, patch } from './client';
import type { ApiResponse } from '@/types/api';
import type { PomodoroRecord, CreatePomodoroInput } from '@/types/pomodoro';

export function createPomodoro(data: CreatePomodoroInput): Promise<ApiResponse<PomodoroRecord>> {
  return post<PomodoroRecord>('/pomodoros', data);
}

export function getPomodoros(params?: { page?: number; pageSize?: number }): Promise<ApiResponse<PomodoroRecord[]>> {
  return get<PomodoroRecord[]>('/pomodoros', params as Record<string, unknown>);
}

export function getTodayPomodoros(): Promise<ApiResponse<PomodoroRecord[]>> {
  return get<PomodoroRecord[]>('/pomodoros/today');
}

export function interruptPomodoro(id: string): Promise<ApiResponse<PomodoroRecord>> {
  return patch<PomodoroRecord>(`/pomodoros/${id}/interrupt`);
}
