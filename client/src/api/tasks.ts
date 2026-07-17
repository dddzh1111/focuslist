import { get, post, put, del, patch } from './client';
import type { ApiResponse } from '@/types/api';
import type { Task, CreateTaskInput, UpdateTaskInput, UpdateTaskStatusInput, ReorderTasksInput, TaskFilters, SelectFromLongTermInput, PomodoroRecord } from '@/types/task';

export function getTasks(filters?: TaskFilters): Promise<ApiResponse<Task[]>> {
  return get<Task[]>('/tasks', filters as Record<string, unknown>);
}

export function getTask(id: string): Promise<ApiResponse<Task>> {
  return get<Task>(`/tasks/${id}`);
}

export function createTask(data: CreateTaskInput): Promise<ApiResponse<Task>> {
  return post<Task>('/tasks', data);
}

export function updateTask(id: string, data: UpdateTaskInput): Promise<ApiResponse<Task>> {
  return put<Task>(`/tasks/${id}`, data);
}

export function updateTaskStatus(id: string, data: UpdateTaskStatusInput): Promise<ApiResponse<Task>> {
  return patch<Task>(`/tasks/${id}/status`, data);
}

export function deleteTask(id: string): Promise<ApiResponse<null>> {
  return del<null>(`/tasks/${id}`);
}

export function reorderTasks(data: ReorderTasksInput): Promise<ApiResponse<null>> {
  return patch<null>('/tasks/reorder', data);
}

export function getTaskPomodoros(id: string): Promise<ApiResponse<PomodoroRecord[]>> {
  return get<PomodoroRecord[]>(`/tasks/${id}/pomodoros`);
}

export function createSubTask(taskId: string, data: CreateTaskInput): Promise<ApiResponse<Task>> {
  return post<Task>(`/tasks/${taskId}/subtasks`, data);
}

export function selectFromLongTerm(taskId: string, data?: SelectFromLongTermInput): Promise<ApiResponse<Task>> {
  return post<Task>(`/tasks/from-long-term/${taskId}`, data || {});
}

export function advanceChapter(taskId: string): Promise<ApiResponse<Task>> {
  return patch<Task>(`/tasks/${taskId}/advance-chapter`);
}

export function toggleChapter(taskId: string, chapterIndex: number, completed: boolean): Promise<ApiResponse<Task>> {
  return patch<Task>(`/tasks/${taskId}/chapters/${chapterIndex}/toggle`, { completed });
}
