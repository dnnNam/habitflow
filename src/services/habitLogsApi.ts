// src/services/habitLogsApi.ts

import { HabitLog } from '../types/habitLog';
import { apiGet, apiPost, apiPatch, createBearerAuthHeader } from './api';

export interface HabitLogsListResponse {
  success: boolean;
  data: HabitLog[];
  timestamp: string;
}

export interface HabitLogResponse {
  success: boolean;
  data: HabitLog;
  timestamp: string;
}

export interface GetHabitLogsParams {
  habitId?: string;
  from?: string;   // 'YYYY-MM-DD'
  to?: string;     // 'YYYY-MM-DD'
  date?: string;   // 'YYYY-MM-DD'
}

export interface CheckInPayload {
  habitId: string;
  logDate: string;          // 'YYYY-MM-DD'
  status?: 'completed' | 'partial' | 'pending';
  progressValue?: number;
  note?: string;
}

export interface SkipPayload {
  logDate: string;          // 'YYYY-MM-DD'
}

/** GET /habit-logs?habitId=&from=&to=&date= */
export function getHabitLogs(
  accessToken: string,
  params: GetHabitLogsParams,
  tokenType = 'Bearer',
) {
  return apiGet<HabitLogsListResponse>('/habit-logs', {
    headers: createBearerAuthHeader(accessToken, tokenType),
    params,
  });
}

/** POST /habit-logs/check-in */
export function checkInHabit(
  accessToken: string,
  payload: CheckInPayload,
  tokenType = 'Bearer',
) {
  return apiPost<HabitLogResponse, CheckInPayload>(
    '/habit-logs/check-in',
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}

/** POST /habit-logs/:habitId/skip */
export function skipHabit(
  accessToken: string,
  habitId: string,
  payload: SkipPayload,
  tokenType = 'Bearer',
) {
  return apiPost<HabitLogResponse, SkipPayload>(
    `/habit-logs/${habitId}/skip`,
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}

/** PATCH /habit-logs/:id */
export function updateHabitLog(
  accessToken: string,
  logId: string,
  payload: Partial<CheckInPayload>,
  tokenType = 'Bearer',
) {
  return apiPatch<HabitLogResponse, Partial<CheckInPayload>>(
    `/habit-logs/${logId}`,
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}

/** POST /habit-logs/process-missed */
export function processMissedLogs(
  accessToken: string,
  tokenType = 'Bearer',
) {
  return apiPost<{ success: boolean }, Record<string, never>>(
    '/habit-logs/process-missed',
    {},
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}