import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Section } from '@/types/list';
import { generateId, nowISO } from '@/lib/localDb';

interface SectionState {
  sectionsByListId: Record<string, Section[]>;
  loading: boolean;
  fetchSections: (listId: string) => Promise<void>;
  createSection: (listId: string, name: string) => Promise<void>;
  updateSection: (id: string, listId: string, data: { name?: string; sortOrder?: number }) => Promise<void>;
  deleteSection: (id: string, listId: string) => Promise<void>;
}

export const useSectionStore = create<SectionState>()(
  persist(
    (set, get) => ({
      sectionsByListId: {},
      loading: false,

      fetchSections: async (listId: string) => {
        set({ loading: true });
        set({ loading: false });
      },

      createSection: async (listId: string, name: string) => {
        const current = get().sectionsByListId[listId] || [];
        const now = nowISO();
        const newSection: Section = {
          id: generateId(),
          name,
          sortOrder: current.length,
          listId,
        };
        set({
          sectionsByListId: {
            ...get().sectionsByListId,
            [listId]: [...current, newSection],
          },
        });
      },

      updateSection: async (id: string, listId: string, data) => {
        const current = get().sectionsByListId[listId] || [];
        set({
          sectionsByListId: {
            ...get().sectionsByListId,
            [listId]: current.map((s) =>
              s.id === id ? { ...s, ...data, } : s
            ),
          },
        });
      },

      deleteSection: async (id: string, listId: string) => {
        const current = get().sectionsByListId[listId] || [];
        set({
          sectionsByListId: {
            ...get().sectionsByListId,
            [listId]: current.filter((s) => s.id !== id),
          },
        });
      },
    }),
    {
      name: 'focuslist-sections',
    }
  )
);
