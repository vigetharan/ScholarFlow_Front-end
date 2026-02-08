export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}