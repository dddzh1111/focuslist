import { get, post, put, del } from './client';
import type { SleepRecord, SleepStats } from '@/types/sleep';

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

export async function getSleepRecords(params?: {
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  const response = await get<SleepRecord[]>('/sleep', params);
  return response;
}

export async function getSleepRecordByDate(date: string) {
  const response = await get<SleepRecord>(`/sleep/${date}`);
  return response;
}

export async function getLatestSleepRecord() {
  const response = await get<SleepRecord>('/sleep/latest');
  return response;
}

export async function getSleepStats(startDate?: string, endDate?: string) {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;
  const response = await get<SleepStats>('/sleep/stats', params);
  return response;
}

export async function createSleepRecord(data: CreateSleepData) {
  const response = await post<SleepRecord>('/sleep', data);
  return response;
}

export async function updateSleepRecord(id: string, data: UpdateSleepData) {
  const response = await put<SleepRecord>(`/sleep/${id}`, data);
  return response;
}

export async function deleteSleepRecord(id: string) {
  const response = await del<void>(`/sleep/${id}`);
  return response;
}
