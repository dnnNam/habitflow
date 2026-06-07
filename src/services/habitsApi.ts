// src/services/habitsApi.ts

import { API_ENDPOINTS, apiGet, apiPost, createBearerAuthHeader } from './api';
import type { Habit, HabitStatus, GoalType, RepeatType, RepeatConfig } from '../types/habit';

export interface HabitsListResponse {
  success: boolean;
  data: Habit[];
  timestamp: string;
}

export interface GetHabitsParams {
  status?: HabitStatus;
  categoryId?: string;
}

export interface CreateHabitPayload {
  name: string;
  description?: string;
  goalType: GoalType;
  categoryId?: string;
  startDate: string;
  endDate?: string | null;
  schedule: {
    repeatType: RepeatType;
    repeatConfig: RepeatConfig;
  };
}

export interface CreateHabitResponse {
  success: boolean;
  data: Habit;
  timestamp: string;
}

/**
 * GET /habits?status=&categoryId=
 */
export function getHabits(
  accessToken: string,
  tokenType = 'Bearer',
  params?: GetHabitsParams,
) {
  return apiGet<HabitsListResponse>(API_ENDPOINTS.habits.list, {
    headers: createBearerAuthHeader(accessToken, tokenType),
    params,
  });
}

/**
 * POST /habits
 */
export function createHabit(
  accessToken: string,
  payload: CreateHabitPayload,
  tokenType = 'Bearer',
) {
  return apiPost<CreateHabitResponse, CreateHabitPayload>(
    API_ENDPOINTS.habits.list,
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}