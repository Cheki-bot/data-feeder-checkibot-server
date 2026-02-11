/**
 * User Role Constants
 * Defines available user roles in the system
 */

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_VALUES: Role[] = Object.values(ROLES);

export const DEFAULT_ROLE: Role = ROLES.USER;
