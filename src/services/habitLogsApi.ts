import { API_ENDPOINTS, apiGet, apiPatch, apiPost, createBearerAuthHeader } from './api';
import type { HabitLog, HabitLogStatus } from '../types/habitLog';

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
  from?: string;
  to?: string;
  date?: string;
}

export interface CheckInHabitPayload {
  habitId: string;
  logDate: string;
  progressValue?: number;
  note?: string;
  status?: HabitLogStatus;
}

export interface SkipHabitPayload {
  logDate: string;
}

export interface UpdateHabitLogPayload {
  progressValue?: number;
  note?: string;
  status?: HabitLogStatus;
}

export interface ProcessMissedPayload {
  processUntilDate?: string;
}

export function getHabitLogs(
  accessToken: string,
  tokenType = 'Bearer',
  params?: GetHabitLogsParams,
) {
  return apiGet<HabitLogsListResponse>(API_ENDPOINTS.habitLogs.list, {
    headers: createBearerAuthHeader(accessToken, tokenType),
    params,
  });
}

export function checkInHabit(
  accessToken: string,
  payload: CheckInHabitPayload,
  tokenType = 'Bearer',
) {
  return apiPost<HabitLogResponse, CheckInHabitPayload>(
    API_ENDPOINTS.habitLogs.checkIn,
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}

export function skipHabit(
  accessToken: string,
  habitId: string,
  payload: SkipHabitPayload,
  tokenType = 'Bearer',
) {
  return apiPost<HabitLogResponse, SkipHabitPayload>(
    API_ENDPOINTS.habitLogs.skip(habitId),
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}

export function updateHabitLog(
  accessToken: string,
  logId: string,
  payload: UpdateHabitLogPayload,
  tokenType = 'Bearer',
) {
  return apiPatch<HabitLogResponse, UpdateHabitLogPayload>(
    API_ENDPOINTS.habitLogs.update(logId),
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}

export function processMissedHabitLogs(
  accessToken: string,
  payload: ProcessMissedPayload = {},
  tokenType = 'Bearer',
) {
  return apiPost<{ success: boolean; timestamp: string }, ProcessMissedPayload>(
    API_ENDPOINTS.habitLogs.processMissed,
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}
