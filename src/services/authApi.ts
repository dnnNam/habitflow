import { API_ENDPOINTS, apiRequest, createBearerAuthHeader } from './api';
import type { User } from '../types/user';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  fullName: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
  tokenType: string;
}

export interface AuthResponse {
  success: boolean;
  data: AuthResponseData;
  timestamp: string;
}

export interface ProfileResponse {
  success: boolean;
  data: User;
  timestamp: string;
}

export function loginUser(payload: LoginPayload) {
  return apiRequest<AuthResponse>(API_ENDPOINTS.auth.login, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function registerUser(payload: RegisterPayload) {
  return apiRequest<AuthResponse>(API_ENDPOINTS.auth.register, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getProfile(accessToken: string, tokenType = 'Bearer') {
  return apiRequest<ProfileResponse>(API_ENDPOINTS.auth.me, {
    method: 'GET',
    headers: createBearerAuthHeader(accessToken, tokenType),
  });
}
