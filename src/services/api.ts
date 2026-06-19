import axios from 'axios';
import type { AxiosError, AxiosRequestConfig } from 'axios';

export const API_TIMEOUT_MS = 30000;
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
  },
  habits: {
    list: '/habits',
    detail: (id: string) => `/habits/${id}`,
    status: (id: string) => `/habits/${id}/status`,
    schedule: (id: string) => `/habits/${id}/schedule`,
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
  return apiRequest<TResponse>(endpoint, { ...options, method: 'GET' });
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

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string | string[]; error?: string }>;
    const data = axiosError.response?.data;

    console.log('[api] axios error status:', axiosError.response?.status);
    console.log('[api] axios error data:', data);

    if (data?.message) {
      // NestJS class-validator trả message: string[]
      if (Array.isArray(data.message)) return data.message.join(', ');
      if (typeof data.message === 'string') return data.message;
    }

    if (data?.error && typeof data.error === 'string') {
      return data.error;
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

export function apiPatch<TResponse, TPayload>(
  endpoint: string,
  payload: TPayload,
  options?: ApiRequestOptions,
) {
  return apiRequest<TResponse>(endpoint, {
    ...options,
    method: 'PATCH',
    data: payload,
  });
}

export function apiPut<TResponse, TPayload>(
  endpoint: string,
  payload: TPayload,
  options?: ApiRequestOptions,
) {
  return apiRequest<TResponse>(endpoint, {
    ...options,
    method: 'PUT',
    data: payload,
  });
}
 
export function apiDelete<TResponse>(
  endpoint: string,
  options?: ApiRequestOptions,
) {
  return apiRequest<TResponse>(endpoint, { ...options, method: 'DELETE' });
}