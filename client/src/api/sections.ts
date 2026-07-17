import { get, post, put, del } from './client';
import type { ApiResponse } from '@/types/api';
import type { Section } from '@/types/list';

export function getSectionsByListId(listId: string): Promise<ApiResponse<Section[]>> {
  return get<Section[]>(`/lists/${listId}/sections`);
}

export function createSection(listId: string, data: { name: string; sortOrder?: number }): Promise<ApiResponse<Section>> {
  return post<Section>(`/lists/${listId}/sections`, data);
}

export function updateSection(id: string, data: { name?: string; sortOrder?: number }): Promise<ApiResponse<Section>> {
  return put<Section>(`/sections/${id}`, data);
}

export function deleteSection(id: string): Promise<ApiResponse<null>> {
  return del<null>(`/sections/${id}`);
}
