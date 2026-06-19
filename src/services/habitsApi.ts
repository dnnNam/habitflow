// src/services/habitsApi.ts

import { API_ENDPOINTS, apiDelete, apiGet, apiPatch, apiPost, apiPut, createBearerAuthHeader } from './api';
import type { Habit, HabitStatus, GoalType, RepeatType, RepeatConfig } from '../types/habit';

export interface HabitsListResponse {
  success: boolean;
  data: Habit[];
  timestamp: string;
}

export interface HabitResponse {
  success: boolean;
  data: Habit;
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

export interface UpdateHabitPayload {
  name?: string;
  description?: string;
  goalType?: GoalType;
  categoryId?: string;
  startDate?: string;
  endDate?: string | null;
}

export interface UpdateHabitStatusPayload {
  status: HabitStatus;
}

export interface UpdateHabitSchedulePayload {
  repeatType: RepeatType;
  repeatConfig: RepeatConfig;
}

/**
 * GET /habits?status=&categoryId=
 * Danh sách habit
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
 * GET /habits/:id
 * Chi tiết 1 habit
 */
export function getHabitById(
  accessToken: string,
  habitId: string,
  tokenType = 'Bearer',
) {
  return apiGet<HabitResponse>(API_ENDPOINTS.habits.detail(habitId), {
    headers: createBearerAuthHeader(accessToken, tokenType),
  });
}

/**
 * POST /habits
 * Tạo habit + schedule + streak
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

/**
 * PATCH /habits/:id
 * Sửa định nghĩa (không đổi log quá khứ)
 */
export function updateHabit(
  accessToken: string,
  habitId: string,
  payload: UpdateHabitPayload,
  tokenType = 'Bearer',
) {
  return apiPatch<HabitResponse, UpdateHabitPayload>(
    API_ENDPOINTS.habits.detail(habitId),
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}

/**
 * PATCH /habits/:id/status
 * active | paused | archived
 */
export function updateHabitStatus(
  accessToken: string,
  habitId: string,
  payload: UpdateHabitStatusPayload,
  tokenType = 'Bearer',
) {
  return apiPatch<HabitResponse, UpdateHabitStatusPayload>(
    API_ENDPOINTS.habits.status(habitId),
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}

/**
 * PUT /habits/:id/schedule
 * Cập nhật lịch
 */
export function updateHabitSchedule(
  accessToken: string,
  habitId: string,
  payload: UpdateHabitSchedulePayload,
  tokenType = 'Bearer',
) {
  return apiPut<HabitResponse, UpdateHabitSchedulePayload>(
    API_ENDPOINTS.habits.schedule(habitId),
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}

/**
 * DELETE /habits/:id
 * Soft delete / archive
 */
export function deleteHabit(
  accessToken: string,
  habitId: string,
  tokenType = 'Bearer',
) {
  return apiDelete<HabitResponse>(API_ENDPOINTS.habits.detail(habitId), {
    headers: createBearerAuthHeader(accessToken, tokenType),
  });
}