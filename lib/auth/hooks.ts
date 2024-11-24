'use client';

import { useSession } from 'next-auth/react';

import type { Session } from 'next-auth';

/**
 * Custom hook to access the current user session on client components.
 *
 * @deprecated Consider using server components with auth() instead.
 * This hook should only be used when client-side session access is absolutely necessary.
 * Server components provide better performance and security by fetching session data on the server.
 *
 * @example
 * // Client Component usage (not recommended)
 * const user = useCurrentUser();
 *
 * @returns {Session['user'] | undefined} The current user data from the session
 */
export const useCurrentUser = (): Session['user'] | undefined => {
  const session = useSession();

  return session.data?.user;
};

/**
 * Custom hook to access the current user role on client components.
 *
 * @deprecated Consider using server components with auth() instead.
 * This hook should only be used when client-side session access is absolutely necessary.
 * Server components provide better performance and security by fetching session data on the server.
 *
 * @example
 * // Client Component usage (not recommended)
 * const userRole = useCurrentRole();
 *
 * @returns {Session['user'] | undefined} The current user data from the session
 */
export const useCurrentRole = (): Session['user']['role'] | undefined => {
  const session = useSession();
  return session?.data?.user?.role;
};
