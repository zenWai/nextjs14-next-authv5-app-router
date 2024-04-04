'use client';
import UserInfo from '@/components/user-info';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function ClientPage() {
  const userSession = useCurrentUser();
  return (
    <div className=''>
      <UserInfo label='💃Client component' user={userSession} />
    </div>
  );
}
