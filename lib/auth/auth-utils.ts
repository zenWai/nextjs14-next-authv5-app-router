import 'server-only';

import { auth } from '@/auth';

import type { Session } from 'next-auth';

/**
 * Retrieves the current user from session in server components
 *
 * @serverOnly This function can only be used in server components or server-side code
 *
 * @returns {Promise<Session['user'] | undefined>} Current user object from session or undefined if not authenticated
 */
export const currentSessionUser = async (): Promise<Session['user'] | undefined> => {
  const session = await auth();

  return session?.user;
};

/**
 * Retrieves the current user's role from session in server components
 *
 * @serverOnly This function can only be used in server components or server-side code
 *
 * @returns {Promise<Session['user']['role'] | undefined>} User's role or undefined if not authenticated
 */
export const currentSessionRole = async (): Promise<Session['user']['role'] | undefined> => {
  const session = await auth();

  return session?.user?.role;
};

/**
 * Checks if current user's session has a specific role
 *
 * @serverOnly This function can only be used in server components or server-side code
 *
 * @param {string} role - The role to check against (e.g., 'ADMIN', 'USER')
 * @returns {Promise<boolean>} True if user has the specified role, false otherwise
 */
export const sessionHasRole = async (role: string): Promise<boolean> => {
  const session = await auth();

  return session?.user?.role === role;
};
