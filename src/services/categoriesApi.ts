// src/services/categoriesApi.ts

import { apiGet, apiPost, createBearerAuthHeader } from './api';
import type { Category } from '../types/category';

export interface CategoriesListResponse {
  success: boolean;
  data: Category[];
  timestamp: string;
}

export interface CreateCategoryPayload {
  name: string;
  color: string;
  icon: string;
}

export interface CreateCategoryResponse {
  success: boolean;
  data: Category;
  timestamp: string;
}

export function getCategories(accessToken: string, tokenType = 'Bearer') {
  return apiGet<CategoriesListResponse>('/categories', {
    headers: createBearerAuthHeader(accessToken, tokenType),
  });
}

export function createCategory(
  accessToken: string,
  payload: CreateCategoryPayload,
  tokenType = 'Bearer',
) {
  return apiPost<CreateCategoryResponse, CreateCategoryPayload>(
    '/categories',
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}