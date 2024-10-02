'use client';

import { useCurrentUser } from '@/hooks/use-current-user';
import UserInfo from '@/components/UserInfo';

export default function ClientComponent() {
  const userSession = useCurrentUser();
  return (
    <div className=''>
      {/* This userInfo component is what we call a hybrid component, as children of a client component, is a client component */}
      <UserInfo label='💃Client component' user={userSession} />
    </div>
  );
}
