import type { Section } from './list';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';
export type Status = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  dueDate: string | null;
  estimatedPomos: number;
  focusDuration: number;  // 单次番茄时长(分钟)，0=使用全局默认
  completedPomos: number;
  totalFocusTime: number;
  tags: string[];
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  parentId: string | null;
  userId: string;
  listId: string | null;
  list?: { id: string; name: string; color: string } | null;
  sectionId?: string;
  section?: Section;
  // 长期任务相关
  isLongTerm: boolean;
  totalChapters: number;
  completedChapters: number;
  chapterCompletions: number[];  // 已完成章节编号数组 [1,2,5]
  // 短期任务来源
  sourceTaskId?: string | null;
  sourceTask?: { id: string; title: string; totalChapters?: number; completedChapters?: number } | null;
  children?: Task[];
  pomodoros?: PomodoroRecord[];
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  estimatedPomos?: number;
  focusDuration?: number;
  tags?: string[];
  listId?: string;
  sectionId?: string;
  parentId?: string;
  // 长期任务
  isLongTerm?: boolean;
  totalChapters?: number;
  sourceTaskId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  estimatedPomos?: number;
  focusDuration?: number;
  tags?: string[];
  listId?: string | null;
  sectionId?: string | null;
  completedChapters?: number;
}

export interface UpdateTaskStatusInput {
  status: Status;
}

export interface ReorderTasksInput {
  tasks: { id: string; sortOrder: number }[];
}

export interface TaskFilters {
  status?: string;
  priority?: string;
  listId?: string;
  sectionId?: string;
  tag?: string;
  keyword?: string;
  dueDate?: string;
  isLongTerm?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface SelectFromLongTermInput {
  title?: string;
  dueDate?: string;
  chapterIndex?: number;
}

export interface PomodoroRecord {
  id: string;
  taskId: string;
  startedAt: string;
  endedAt: string | null;
  duration: number;
  completed: boolean;
  interrupted: boolean;
}
