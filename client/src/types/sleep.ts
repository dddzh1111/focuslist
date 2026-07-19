export interface SleepRecord {
  id: string;
  date: string;
  sleepTime: string;
  wakeTime?: string;
  durationMinutes?: number;
  quality?: 'GREAT' | 'GOOD' | 'FAIR' | 'POOR';
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface SleepStats {
  totalRecords: number;
  avgDurationMinutes: number;
  totalDurationMinutes: number;
  qualityCounts: Record<string, number>;
  records: SleepRecord[];
}

export const qualityConfig: Record<string, { label: string; color: string; emoji: string }> = {
  GREAT: { label: '很棒', color: '#22C55E', emoji: '😴' },
  GOOD: { label: '不错', color: '#3B82F6', emoji: '😊' },
  FAIR: { label: '一般', color: '#F59E0B', emoji: '😐' },
  POOR: { label: '不好', color: '#EF4444', emoji: '😫' },
};
