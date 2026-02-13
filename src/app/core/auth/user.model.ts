export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export interface UserResponse {
  id: string;
  email: string;
  userName: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}