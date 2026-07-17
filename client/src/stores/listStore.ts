import { create } from 'zustand';
import type { List, CreateListInput, UpdateListInput } from '@/types/list';
import * as listApi from '@/api/lists';

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

export const useListStore = create<ListState>((set, get) => ({
  lists: [],
  loading: false,
  error: null,

  fetchLists: async () => {
    set({ loading: true, error: null });
    try {
      const response = await listApi.getLists();
      set({ lists: response.data, loading: false });
    } catch (err) {
      set({ error: '获取清单列表失败', loading: false });
    }
  },

  createList: async (data) => {
    const response = await listApi.createList(data);
    set({ lists: [...get().lists, response.data] });
    return response.data;
  },

  updateList: async (id, data) => {
    const response = await listApi.updateList(id, data);
    set({
      lists: get().lists.map((l) => (l.id === id ? response.data : l)),
    });
    return response.data;
  },

  deleteList: async (id) => {
    await listApi.deleteList(id);
    set({ lists: get().lists.filter((l) => l.id !== id) });
  },

  reorderLists: async (lists) => {
    await listApi.reorderLists({ lists });
    set({
      lists: get().lists
        .map((l) => {
          const updated = lists.find((r) => r.id === l.id);
          return updated ? { ...l, sortOrder: updated.sortOrder } : l;
        })
        .sort((a, b) => a.sortOrder - b.sortOrder),
    });
  },
}));
