export interface User {
  id: string;
  fullName: string;
  name?: string;
  email: string;
  timeZone?: string;
  role?: string;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}
