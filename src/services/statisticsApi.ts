import { API_ENDPOINTS, apiGet, createBearerAuthHeader } from './api';
import type {
  HabitStatistics,
  PeriodStatistics,
  StatisticsOverview,
  StatisticsPeriod,
} from '../types/statistics';

export interface StatisticsOverviewResponse {
  success: boolean;
  data: StatisticsOverview;
  timestamp: string;
}

export interface PeriodStatisticsResponse {
  success: boolean;
  data: PeriodStatistics;
  timestamp: string;
}

export interface HabitStatisticsResponse {
  success: boolean;
  data: HabitStatistics;
  timestamp: string;
}

export interface StatisticsPeriodParams {
  from: string;
  to: string;
}

export interface StatisticsOverviewParams {
  period?: StatisticsPeriod;
}

export function getStatisticsOverview(
  accessToken: string,
  tokenType = 'Bearer',
  params?: StatisticsOverviewParams,
) {
  return apiGet<StatisticsOverviewResponse>(API_ENDPOINTS.statistics.overview, {
    headers: createBearerAuthHeader(accessToken, tokenType),
    params,
  });
}

export function getPeriodStatistics(
  accessToken: string,
  params: StatisticsPeriodParams,
  tokenType = 'Bearer',
) {
  return apiGet<PeriodStatisticsResponse>(API_ENDPOINTS.statistics.period, {
    headers: createBearerAuthHeader(accessToken, tokenType),
    params,
  });
}

export function getHabitStatistics(
  accessToken: string,
  habitId: string,
  params?: Partial<StatisticsPeriodParams>,
  tokenType = 'Bearer',
) {
  return apiGet<HabitStatisticsResponse>(API_ENDPOINTS.statistics.habit(habitId), {
    headers: createBearerAuthHeader(accessToken, tokenType),
    params,
  });
}
