import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { List, CreateListInput, UpdateListInput } from '@/types/list';
import { generateId, nowISO } from '@/lib/localDb';

interface ListState {
  lists: List[];
  loading: boolean;
  error: string | null;
  fetchLists: () => Promise<void>;
  createList: (data: CreateListInput) => Promise<List>;
  updateList: (id: string, data: UpdateListInput) => Promise<List>;
  deleteList: (id: string) => Promise<void>;
  reorderLists: (lists: { id: string; sortOrder: number }[]) => Promise<void>;
}

const COLORS = ['#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

export const useListStore = create<ListState>()(
  persist(
    (set, get) => ({
      lists: [],
      loading: false,
      error: null,

      fetchLists: async () => {
        set({ loading: true, error: null });
        set({ loading: false });
      },

      createList: async (data) => {
        const now = nowISO();
        const newList: List = {
          id: generateId(),
          name: data.name,
          color: data.color || COLORS[get().lists.length % COLORS.length],
          icon: data.icon || '📋',
          sortOrder: get().lists.length,
          createdAt: now,
          updatedAt: now,
          userId: 'local',
        };
        set({ lists: [...get().lists, newList] });
        return newList;
      },

      updateList: async (id, data) => {
        let updated: List | undefined;
        set({
          lists: get().lists.map((l) => {
            if (l.id === id) {
              updated = { ...l, ...data, updatedAt: nowISO() };
              return updated;
            }
            return l;
          }),
        });
        if (!updated) throw new Error('List not found');
        return updated;
      },

      deleteList: async (id) => {
        set({ lists: get().lists.filter((l) => l.id !== id) });
      },

      reorderLists: async (lists) => {
        const listMap = new Map(lists.map((l) => [l.id, l.sortOrder]));
        set({
          lists: get()
            .lists.map((l) => {
              const sortOrder = listMap.get(l.id);
              return sortOrder !== undefined ? { ...l, sortOrder } : l;
            })
            .sort((a, b) => a.sortOrder - b.sortOrder),
        });
      },
    }),
    {
      name: 'focuslist-lists',
    }
  )
);
