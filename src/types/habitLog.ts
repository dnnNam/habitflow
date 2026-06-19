export type HabitLogStatus = 'pending' | 'partial' | 'completed' | 'skipped' | 'missed';

export interface HabitLog {
  id: string;
  habitId: string;
  logDate: string;
  progressValue: number;
  note?: string | null;
  status: HabitLogStatus;
  createdAt?: string;
  updatedAt?: string;
}
