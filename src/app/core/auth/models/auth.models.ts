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
  role: UserRoleValue;
  organizationId: string;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: UserDto;
}

/**
 * F-8 — l'API serialise ses enums en ENTIERS.
 *
 * Ce type valait `'Admin' | 'Planificateur' | 'Technicien'` et `UserDto.role`
 * s'en reclamait. Mais rien ne verifie une annotation de type sur du JSON :
 * l'API renvoie `role: 0`, et la sidebar cherchait `roleLabels[0]` dans une
 * table indexee par des chaines. Elle affichait donc « 0 », ou rien.
 *
 * On decrit desormais ce qui circule reellement, et la conversion en libelle
 * est explicite. L'alternative — poser un JsonStringEnumConverter cote API —
 * changerait le contrat de TOUS les enums (statut, type, priorite), dont le
 * front depend numeriquement un peu partout : bien plus risque pour le meme
 * resultat.
 */
export type UserRoleValue = 0 | 1 | 2;

export type UserRole = 'Admin' | 'Planificateur' | 'Technicien';

/** Correspondance entre la valeur transmise par l'API et le nom du role. */
export const USER_ROLE_NAMES: Record<UserRoleValue, UserRole> = {
  0: 'Admin',
  1: 'Planificateur',
  2: 'Technicien',
};

/** Libelle affichable, en francais. */
export const USER_ROLE_LABELS: Record<UserRoleValue, string> = {
  0: 'Administrateur',
  1: 'Planificateur',
  2: 'Technicien',
};
