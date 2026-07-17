import { get, put } from './client';
import type { ApiResponse } from '@/types/api';
import type { PomodoroSettings } from '@/types/pomodoro';

export function getSettings(): Promise<ApiResponse<PomodoroSettings>> {
  return get<PomodoroSettings>('/settings');
}

export function updateSettings(data: Partial<PomodoroSettings>): Promise<ApiResponse<PomodoroSettings>> {
  return put<PomodoroSettings>('/settings', data);
}
