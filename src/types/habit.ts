// src/types/habit.ts

export type GoalType = 'boolean' | 'count' | 'duration' | 'distance';
export type RepeatType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type HabitStatus = 'active' | 'paused' | 'archived';

export interface RepeatConfig {
  daysOfWeek?: number[];  // weekly: 1=T2 ... 7=CN (ISO)
  daysOfMonth?: number[]; // monthly: 1–31
  intervalDays?: number;  // custom: mỗi N ngày kể từ startDate
}

export interface Schedule {
  repeatType: RepeatType;
  repeatConfig: RepeatConfig;
}

export interface Habit {
  id: string;
  name: string;
  description?: string;
  goalType: GoalType;
  categoryId?: string;
  startDate: string;
  endDate?: string | null;
  status: HabitStatus;
  streak?: number;
  schedule?: Schedule;
  createdAt?: string;
  updatedAt?: string;
}