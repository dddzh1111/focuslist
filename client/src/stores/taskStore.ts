import { create } from 'zustand';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilters, SelectFromLongTermInput } from '@/types/task';
import * as taskApi from '@/api/tasks';
import type { PaginationMeta } from '@/types/api';

export type TaskViewMode = 'long-term' | 'daily';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  pagination: PaginationMeta | null;
  activeTaskId: string | null;
  viewMode: TaskViewMode;
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  createTask: (data: CreateTaskInput) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskInput) => Promise<Task>;
  updateStatus: (id: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  reorderTasks: (tasks: { id: string; sortOrder: number }[]) => Promise<void>;
  setFilters: (filters: Partial<TaskFilters>) => void;
  setActiveTask: (taskId: string | null) => void;
  setViewMode: (mode: TaskViewMode) => void;
  selectFromLongTerm: (taskId: string, data?: SelectFromLongTermInput) => Promise<Task>;
  advanceChapter: (taskId: string) => Promise<void>;
  toggleChapter: (taskId: string, chapterIndex: number, completed: boolean) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,
  filters: { page: 1, pageSize: 20 },
  pagination: null,
  activeTaskId: null,
  viewMode: 'daily',

  fetchTasks: async (filters?: TaskFilters) => {
    const mergedFilters = { ...get().filters, ...filters };
    set({ loading: true, error: null, filters: mergedFilters });
    try {
      const response = await taskApi.getTasks(mergedFilters);
      set({
        tasks: response.data,
        loading: false,
        pagination: response.pagination || null,
      });
    } catch (err) {
      set({ error: '获取任务列表失败', loading: false });
    }
  },

  createTask: async (data) => {
    try {
      const response = await taskApi.createTask(data);
      set({ tasks: [response.data, ...get().tasks] });
      return response.data;
    } catch (err) {
      set({ error: '创建任务失败' });
      throw err;
    }
  },

  updateTask: async (id, data) => {
    const response = await taskApi.updateTask(id, data);
    set({
      tasks: get().tasks.map((t) => (t.id === id ? response.data : t)),
    });
    return response.data;
  },

  updateStatus: async (id, status) => {
    await taskApi.updateTaskStatus(id, { status });
    set({
      tasks: get().tasks.map((t) => (t.id === id ? { ...t, status } : t)),
    });
  },

  deleteTask: async (id) => {
    await taskApi.deleteTask(id);
    set({ tasks: get().tasks.filter((t) => t.id !== id) });
  },

  reorderTasks: async (tasks) => {
    await taskApi.reorderTasks({ tasks });
    set({
      tasks: get().tasks
        .map((t) => {
          const updated = tasks.find((r) => r.id === t.id);
          return updated ? { ...t, sortOrder: updated.sortOrder } : t;
        })
        .sort((a, b) => a.sortOrder - b.sortOrder),
    });
  },

  setFilters: (filters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  setActiveTask: (taskId) => {
    set({ activeTaskId: taskId });
  },

  setViewMode: (mode) => {
    const isLongTerm = mode === 'long-term' ? 'true' : 'false';
    set({ viewMode: mode });
    get().fetchTasks({ isLongTerm, page: 1 });
  },

  selectFromLongTerm: async (taskId, data) => {
    const response = await taskApi.selectFromLongTerm(taskId, data);
    // 刷新当前视图
    await get().fetchTasks();
    return response.data;
  },

  advanceChapter: async (taskId) => {
    const response = await taskApi.advanceChapter(taskId);
    // 更新本地状态
    set({
      tasks: get().tasks.map((t) => (t.id === taskId ? response.data : t)),
    });
  },

  toggleChapter: async (taskId, chapterIndex, completed) => {
    const response = await taskApi.toggleChapter(taskId, chapterIndex, completed);
    set({
      tasks: get().tasks.map((t) => (t.id === taskId ? response.data : t)),
    });
  },
}));
