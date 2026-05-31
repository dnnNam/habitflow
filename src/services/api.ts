export const API_TIMEOUT_MS = 15000;
export const API_BASE_URL = 'https://habitzen-u21c.onrender.com/api/v1';

export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    me: '/auth/me',
  },
} as const;

export interface ApiRequestOptions extends RequestInit {
  timeoutMs?: number;
}

export async function apiRequest<TResponse>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<TResponse> {
  const { timeoutMs = API_TIMEOUT_MS, ...requestOptions } = options;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...requestOptions,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...requestOptions.headers,
      },
    });

    if (!response.ok) {
      const message = await getErrorMessage(response);
      throw new Error(message);
    }

    return response.json() as Promise<TResponse>;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function createBearerAuthHeader(accessToken: string, tokenType = 'Bearer') {
  return {
    Authorization: `${tokenType} ${accessToken}`,
  };
}

async function getErrorMessage(response: Response) {
  try {
    const body = await response.json();

    if (typeof body?.message === 'string') {
      return body.message;
    }

    if (typeof body?.error === 'string') {
      return body.error;
    }
  } catch {
    return `Request failed with status ${response.status}`;
  }

  return `Request failed with status ${response.status}`;
}
