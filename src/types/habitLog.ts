

export type HabitLogStatus = 'completed' | 'partial' | 'pending' | 'skipped' | 'missed';

export interface HabitLog {
  id: string;
  habitId: string;
  userId?: string;
  logDate: string;           // 'YYYY-MM-DD'
  status: HabitLogStatus;
  progressValue?: number | null;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
}