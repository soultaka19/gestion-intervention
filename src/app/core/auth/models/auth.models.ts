export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  organizationName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: UserDto;
}

export type UserRole = 'Admin' | 'Planificateur' | 'Technicien';
