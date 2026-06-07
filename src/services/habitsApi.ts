// src/services/habitsApi.ts

import { API_ENDPOINTS, apiGet, createBearerAuthHeader } from './api';
import type { Habit, HabitStatus } from '../types/habit';

export interface HabitsListResponse {
  success: boolean;
  data: Habit[];
  timestamp: string;
}

export interface GetHabitsParams {
  status?: HabitStatus;
  categoryId?: string;
}

/**
 * GET /habits?status=&categoryId=
 * Lấy danh sách habit của user hiện tại.
 */
export function getHabits(
  accessToken: string,
  tokenType = 'Bearer',
  params?: GetHabitsParams,
) {
  return apiGet<HabitsListResponse>(API_ENDPOINTS.habits.list, {
    headers: createBearerAuthHeader(accessToken, tokenType),
    params, // axios tự append query string: ?status=active&categoryId=xxx
  });
}