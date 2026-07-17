export interface List {
  id: string;
  name: string;
  color: string;
  icon: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  userId: string;
  _count?: {
    tasks: number;
  };
}

export interface CreateListInput {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateListInput {
  name?: string;
  color?: string;
  icon?: string;
}

export interface ReorderListsInput {
  lists: { id: string; sortOrder: number }[];
}

export interface Section {
  id: string;
  name: string;
  sortOrder: number;
  listId: string;
  _count?: { tasks: number };
}
