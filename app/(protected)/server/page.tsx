import UserInfo from '@/components/user-info';
import { currentSessionUser } from '@/lib/auth-utils';

export default async function ServerPage() {
  const userSession = await currentSessionUser();
  return (
    <div className=''>
      <UserInfo label='💻Server component' user={userSession} />
    </div>
  );
}
