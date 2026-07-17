import { get, post, put, del, patch } from './client';
import type { ApiResponse } from '@/types/api';
import type { List, CreateListInput, UpdateListInput, ReorderListsInput } from '@/types/list';

export function getLists(): Promise<ApiResponse<List[]>> {
  return get<List[]>('/lists');
}

export function createList(data: CreateListInput): Promise<ApiResponse<List>> {
  return post<List>('/lists', data);
}

export function updateList(id: string, data: UpdateListInput): Promise<ApiResponse<List>> {
  return put<List>(`/lists/${id}`, data);
}

export function deleteList(id: string): Promise<ApiResponse<null>> {
  return del<null>(`/lists/${id}`);
}

export function reorderLists(data: ReorderListsInput): Promise<ApiResponse<null>> {
  return patch<null>('/lists/reorder', data);
}
