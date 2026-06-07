import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';

export const API_TIMEOUT_MS = 30000;
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ;

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
  },
  habits: {
    list: '/habits', // GET /habits?status=&categoryId=
  },
} as const;

export interface ApiRequestOptions extends AxiosRequestConfig {
  timeoutMs?: number;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function apiRequest<TResponse>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  try {
    const { timeoutMs = API_TIMEOUT_MS, ...requestOptions } = options;
    const response = await apiClient.request<TResponse>({
      url: endpoint,
      timeout: timeoutMs,
      ...requestOptions,
    });

    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

export function apiGet<TResponse>(
  endpoint: string,
  options?: ApiRequestOptions,
) {
  return apiRequest<TResponse>(endpoint, {
    ...options,
    method: 'GET',
  });
}

export function apiPost<TResponse, TPayload>(
  endpoint: string,
  payload: TPayload,
  options?: ApiRequestOptions,
) {
  return apiRequest<TResponse>(endpoint, {
    ...options,
    method: 'POST',
    data: payload,
  });
}

export function createBearerAuthHeader(accessToken: string, tokenType = 'Bearer') {
  return {
    Authorization: `${tokenType} ${accessToken}`,
  };
}

function getErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; error?: string }>;
    const message = axiosError.response?.data?.message;
    const responseError = axiosError.response?.data?.error;

    if (message) {
      return message;
    }

    if (responseError) {
      return responseError;
    }

    if (axiosError.response?.status) {
      return `Request failed with status ${axiosError.response.status}`;
    }

    return axiosError.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Request failed. Please try again.';
}
