export interface Reminder {
  id: string;
  habitId: string;
  userId?: string;
  // API thực tế trả về ISO datetime đầy đủ (vd '1970-01-01T10:25:00.000Z'),
  // chỉ phần giờ:phút (UTC) là có ý nghĩa, ngày là epoch giả định.
  remindAt: string;
  isEnabled: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}
 
// Habit "due" trả về từ GET /reminders/due — habit active, có lịch hôm nay,
// chưa completed, có reminder đang bật.
export interface DueHabit {
  id: string;
  name: string;
  goalType: string;
  reminders: Reminder[];
}