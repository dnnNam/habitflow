// API Reminders (theo spec):
//   GET    /habits/:habitId/reminders   -> Danh sách nhắc của 1 habit
//   POST   /habits/:habitId/reminders   -> Tạo nhắc { remindAt, isEnabled }
//   GET    /reminders/due               -> Habit cần nhắc hôm nay (cho push local)
//   PATCH  /reminders/:id               -> Sửa giờ / bật tắt
//   DELETE /reminders/:id               -> Xóa mềm
 
import { apiDelete, apiGet, apiPatch, apiPost, createBearerAuthHeader } from './api';
import type { DueHabit, Reminder } from '../types/reminder';
 
export interface RemindersListResponse {
  success: boolean;
  data: Reminder[];
  timestamp: string;
}
 
export interface ReminderResponse {
  success: boolean;
  data: Reminder;
  timestamp: string;
}
 
export interface DueHabitsResponse {
  success: boolean;
  data: DueHabit[];
  timestamp: string;
}
 
export interface CreateReminderPayload {
  remindAt: string; // 'HH:mm'
  isEnabled?: boolean;
}
 
export interface UpdateReminderPayload {
  remindAt?: string;
  isEnabled?: boolean;
}
 
/** GET /habits/:habitId/reminders */
export function getHabitReminders(
  accessToken: string,
  habitId: string,
  tokenType = 'Bearer',
) {
  return apiGet<RemindersListResponse>(`/habits/${habitId}/reminders`, {
    headers: createBearerAuthHeader(accessToken, tokenType),
  });
}
 
/** POST /habits/:habitId/reminders */
export function createReminder(
  accessToken: string,
  habitId: string,
  payload: CreateReminderPayload,
  tokenType = 'Bearer',
) {
  return apiPost<ReminderResponse, CreateReminderPayload>(
    `/habits/${habitId}/reminders`,
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}
 
/** GET /reminders/due — dùng cho local push notification */
export function getDueReminders(accessToken: string, tokenType = 'Bearer') {
  return apiGet<DueHabitsResponse>('/reminders/due', {
    headers: createBearerAuthHeader(accessToken, tokenType),
  });
}
 
/** PATCH /reminders/:id — sửa giờ hoặc bật/tắt */
export function updateReminder(
  accessToken: string,
  reminderId: string,
  payload: UpdateReminderPayload,
  tokenType = 'Bearer',
) {
  return apiPatch<ReminderResponse, UpdateReminderPayload>(
    `/reminders/${reminderId}`,
    payload,
    { headers: createBearerAuthHeader(accessToken, tokenType) },
  );
}
 
/** DELETE /reminders/:id — xóa mềm */
export function deleteReminder(
  accessToken: string,
  reminderId: string,
  tokenType = 'Bearer',
) {
  return apiDelete<ReminderResponse>(`/reminders/${reminderId}`, {
    headers: createBearerAuthHeader(accessToken, tokenType),
  });
}