/**
 * User Role Constants
 * Defines available user roles in the system
 */

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
};

/**
 * Array of valid role values
 * Used for validation
 */
export const ROLE_VALUES = Object.values(ROLES);

/**
 * Default role for new users
 */
export const DEFAULT_ROLE = ROLES.USER;
