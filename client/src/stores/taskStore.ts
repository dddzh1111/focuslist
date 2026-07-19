import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Task, CreateTaskInput, UpdateTaskInput, TaskFilters, SelectFromLongTermInput } from '@/types/task';
import { generateId, nowISO } from '@/lib/localDb';

export type TaskViewMode = 'long-term' | 'daily';

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
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
  updateTaskPomoStats: (taskId: string, focusSeconds: number) => void;
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      tasks: [],
      loading: false,
      error: null,
      filters: { page: 1, pageSize: 20 },
      activeTaskId: null,
      viewMode: 'daily',

      fetchTasks: async (filters?: TaskFilters) => {
        const mergedFilters = { ...get().filters, ...filters };
        set({ loading: true, error: null, filters: mergedFilters });
        set({ loading: false });
      },

      createTask: async (data) => {
        const now = nowISO();
        const newTask: Task = {
          id: generateId(),
          title: data.title,
          description: data.description || '',
          priority: data.priority || 'MEDIUM',
          status: 'TODO',
          dueDate: data.dueDate || null,
          estimatedPomos: data.estimatedPomos || 1,
          focusDuration: data.focusDuration || 0,
          completedPomos: 0,
          totalFocusTime: 0,
          tags: data.tags || [],
          sortOrder: get().tasks.length,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
          parentId: data.parentId || null,
          userId: 'local',
          listId: data.listId || null,
          sectionId: data.sectionId,
          isLongTerm: data.isLongTerm || false,
          totalChapters: data.totalChapters || 0,
          completedChapters: 0,
          chapterCompletions: [],
          sourceTaskId: data.sourceTaskId || null,
        };
        set({ tasks: [newTask, ...get().tasks] });
        return newTask;
      },

      updateTask: async (id, data) => {
        const task = get().tasks.find((t) => t.id === id);
        if (!task) throw new Error('Task not found');
        const updatedTask: Task = { 
          ...task, 
          ...data, 
          sectionId: data.sectionId === null ? undefined : data.sectionId ?? task.sectionId,
          updatedAt: nowISO() 
        };
        set({
          tasks: get().tasks.map((t) => (t.id === id ? updatedTask : t)),
        });
        return updatedTask;
      },

      updateStatus: async (id, status) => {
        const now = nowISO();
        set({
          tasks: get().tasks.map((t) =>
            t.id === id
              ? {
                  ...t,
                  status,
                  updatedAt: now,
                  completedAt: status === 'DONE' ? now : t.completedAt,
                }
              : t
          ),
        });
      },

      deleteTask: async (id) => {
        set({ tasks: get().tasks.filter((t) => t.id !== id) });
      },

      reorderTasks: async (tasks) => {
        const taskMap = new Map(tasks.map((t) => [t.id, t.sortOrder]));
        set({
          tasks: get()
            .tasks.map((t) => {
              const sortOrder = taskMap.get(t.id);
              return sortOrder !== undefined ? { ...t, sortOrder } : t;
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
        const sourceTask = get().tasks.find((t) => t.id === taskId);
        if (!sourceTask) throw new Error('Source task not found');

        let title = sourceTask.title;
        let chapterIndex = data?.chapterIndex;

        if (chapterIndex === undefined) {
          const nextChapter = sourceTask.completedChapters + 1;
          if (nextChapter <= sourceTask.totalChapters) {
            chapterIndex = nextChapter;
          }
        }

        if (chapterIndex !== undefined && chapterIndex > 0) {
          title = `${sourceTask.title} - 第${chapterIndex}章`;
        }

        if (data?.title) {
          title = data.title;
        }

        const now = nowISO();
        const newTask: Task = {
          id: generateId(),
          title,
          description: sourceTask.description,
          priority: sourceTask.priority,
          status: 'TODO',
          dueDate: data?.dueDate || null,
          estimatedPomos: 1,
          focusDuration: 0,
          completedPomos: 0,
          totalFocusTime: 0,
          tags: [...sourceTask.tags],
          sortOrder: get().tasks.length,
          createdAt: now,
          updatedAt: now,
          completedAt: null,
          parentId: null,
          userId: 'local',
          listId: sourceTask.listId,
          sectionId: sourceTask.sectionId,
          isLongTerm: false,
          totalChapters: 0,
          completedChapters: 0,
          chapterCompletions: [],
          sourceTaskId: taskId,
          sourceTask: {
            id: sourceTask.id,
            title: sourceTask.title,
            totalChapters: sourceTask.totalChapters,
            completedChapters: sourceTask.completedChapters,
          },
        };

        set({ tasks: [newTask, ...get().tasks] });
        return newTask;
      },

      advanceChapter: async (taskId) => {
        set({
          tasks: get().tasks.map((t) => {
            if (t.id !== taskId) return t;
            const nextChapter = t.completedChapters + 1;
            if (nextChapter > t.totalChapters) return t;
            const newCompletions = [...t.chapterCompletions, nextChapter];
            return {
              ...t,
              completedChapters: nextChapter,
              chapterCompletions: newCompletions,
              updatedAt: nowISO(),
            };
          }),
        });
      },

      toggleChapter: async (taskId, chapterIndex, completed) => {
        set({
          tasks: get().tasks.map((t) => {
            if (t.id !== taskId) return t;
            let newCompletions: number[];
            if (completed) {
              newCompletions = [...new Set([...t.chapterCompletions, chapterIndex])].sort(
                (a, b) => a - b
              );
            } else {
              newCompletions = t.chapterCompletions.filter((c) => c !== chapterIndex);
            }
            return {
              ...t,
              chapterCompletions: newCompletions,
              completedChapters: newCompletions.length,
              updatedAt: nowISO(),
            };
          }),
        });
      },

      updateTaskPomoStats: (taskId: string, focusSeconds: number) => {
        set({
          tasks: get().tasks.map((t) => {
            if (t.id !== taskId) return t;
            return {
              ...t,
              completedPomos: t.completedPomos + 1,
              totalFocusTime: t.totalFocusTime + focusSeconds,
              updatedAt: nowISO(),
            };
          }),
        });
      },
    }),
    {
      name: 'focuslist-tasks',
    }
  )
);
