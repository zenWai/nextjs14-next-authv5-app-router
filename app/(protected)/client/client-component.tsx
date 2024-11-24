'use client';

import { UserInfo } from '@/components/user/profile/UserInfo';
import { useCurrentUser } from '@/lib/auth/hooks';

import type { Session } from 'next-auth';

/**
 * Example client component demonstrating client-side session access.
 *
 * @notice This is for demonstration purposes only.
 * Prefer fetching user session data in server components using auth()
 * for better performance and security.
 */
export default function ClientComponent() {
  const userSession: Session['user'] | undefined = useCurrentUser();
  return (
    <div className=''>
      {/* This userInfo component is what we call a hybrid component, as children of a client component, is a client component */}
      <UserInfo label='💃Client component' user={userSession} />
    </div>
  );
}
