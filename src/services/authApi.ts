import { API_ENDPOINTS, apiGet, apiPost, createBearerAuthHeader } from './api';
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
  return apiPost<AuthResponse, LoginPayload>(API_ENDPOINTS.auth.login, payload);
}

export function registerUser(payload: RegisterPayload) {
  return apiPost<AuthResponse, RegisterPayload>(API_ENDPOINTS.auth.register, payload);
}

export function getProfile(accessToken: string, tokenType = 'Bearer') {
  return apiGet<ProfileResponse>(API_ENDPOINTS.auth.me, {
    headers: createBearerAuthHeader(accessToken, tokenType),
  });
}
