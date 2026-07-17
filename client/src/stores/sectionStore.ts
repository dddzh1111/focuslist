import { create } from 'zustand';
import type { Section } from '@/types/list';
import * as sectionApi from '@/api/sections';

interface SectionState {
  sectionsByListId: Record<string, Section[]>;
  loading: boolean;
  fetchSections: (listId: string) => Promise<void>;
  createSection: (listId: string, name: string) => Promise<void>;
  updateSection: (id: string, listId: string, data: { name?: string; sortOrder?: number }) => Promise<void>;
  deleteSection: (id: string, listId: string) => Promise<void>;
}

export const useSectionStore = create<SectionState>((set, get) => ({
  sectionsByListId: {},
  loading: false,

  fetchSections: async (listId: string) => {
    set({ loading: true });
    try {
      const response = await sectionApi.getSectionsByListId(listId);
      set({
        sectionsByListId: { ...get().sectionsByListId, [listId]: response.data },
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  createSection: async (listId: string, name: string) => {
    const response = await sectionApi.createSection(listId, { name });
    const current = get().sectionsByListId[listId] || [];
    set({
      sectionsByListId: {
        ...get().sectionsByListId,
        [listId]: [...current, response.data],
      },
    });
  },

  updateSection: async (id: string, listId: string, data) => {
    const response = await sectionApi.updateSection(id, data);
    const current = get().sectionsByListId[listId] || [];
    set({
      sectionsByListId: {
        ...get().sectionsByListId,
        [listId]: current.map((s) => (s.id === id ? response.data : s)),
      },
    });
  },

  deleteSection: async (id: string, listId: string) => {
    await sectionApi.deleteSection(id);
    const current = get().sectionsByListId[listId] || [];
    set({
      sectionsByListId: {
        ...get().sectionsByListId,
        [listId]: current.filter((s) => s.id !== id),
      },
    });
  },
}));
