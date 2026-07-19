export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

export function nowISO(): string {
  return new Date().toISOString();
}

export interface CrudState<T> {
  items: T[];
}

export function createCrudHelpers<T extends { id: string; createdAt: string; updatedAt: string }>() {
  function addItem(state: CrudState<T>, item: Omit<T, 'id' | 'createdAt' | 'updatedAt'> & Partial<T>): T[] {
    const newItem = {
      ...item,
      id: generateId(),
      createdAt: nowISO(),
      updatedAt: nowISO(),
    } as T;
    return [newItem, ...state.items];
  }

  function updateItem(state: CrudState<T>, id: string, updates: Partial<T>): T[] {
    return state.items.map((item) =>
      item.id === id ? { ...item, ...updates, updatedAt: nowISO() } : item
    );
  }

  function deleteItem(state: CrudState<T>, id: string): T[] {
    return state.items.filter((item) => item.id !== id);
  }

  function findItem(state: CrudState<T>, id: string): T | undefined {
    return state.items.find((item) => item.id === id);
  }

  return { addItem, updateItem, deleteItem, findItem };
}
