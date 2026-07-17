import { get } from './client';
import type { ApiResponse } from '@/types/api';
import type { Task } from '@/types/task';

export interface CalendarData {
  [date: string]: Task[];
}

export function getCalendarData(start: string, end: string): Promise<ApiResponse<CalendarData>> {
  return get<CalendarData>('/calendar', { start, end });
}
