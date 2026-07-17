export interface SectionProgress {
  sectionId: string;
  name: string;
  totalTasks: number;
  doneTasks: number;
  completionRate: number;
}

export interface ListProgress {
  listId: string;
  listName: string;
  color: string;
  totalTasks: number;
  doneTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionRate: number;
  sections: SectionProgress[];
}
