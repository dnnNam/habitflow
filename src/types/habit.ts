// src/types/habit.ts

import type { Category } from './category';
import type { Reminder } from './reminder';

export type GoalType = 'boolean' | 'count' | 'duration' | 'distance';
export type RepeatType = 'daily' | 'weekly' | 'monthly' | 'custom';
export type HabitStatus = 'active' | 'paused' | 'archived';

export interface RepeatConfig {
  daysOfWeek?: number[];  // weekly: 1=T2 ... 7=CN (ISO)
  daysOfMonth?: number[]; // monthly: 1–31
  intervalDays?: number;  // custom: mỗi N ngày kể từ startDate
}

export interface Schedule {
  id?: string;
  habitId?: string;
  repeatType: RepeatType;
  repeatConfig: RepeatConfig;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

// streak trả về từ API là 1 OBJECT, không phải số
export interface HabitStreak {
  id: string;
  habitId: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

export interface Habit {
  id: string;
  userId?: string;
  categoryId?: string | null;
  name: string;
  description?: string | null;
  goalType: GoalType;
  goalValue?: number | null;
  goalUnit?: string | null;
  status: HabitStatus;
  startDate: string;
  endDate?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  // Quan hệ lồng trả kèm trong GET /habits
  category?: Category | null;
  schedule?: Schedule | null;
  streak?: HabitStreak | null;
  reminders?: Reminder[];
}