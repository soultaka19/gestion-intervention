import { UserDto, UserRoleValue } from '../auth/models/auth.models';

/** Un compte du bac à sable. Les trois rôles sont fournis pour pouvoir basculer. */
export interface DemoAccount {
  email: string;
  role: UserRoleValue;
  firstName: string;
  lastName: string;
}

/** Réponse de POST /demo/sandbox. */
export interface DemoSession {
  token: string;
  tokenExpiresAt: string;
  user: UserDto;
  organizationId: string;
  organizationName: string;
  sandboxExpiresAt: string;
  sharedPassword: string;
  accounts: DemoAccount[];
}
