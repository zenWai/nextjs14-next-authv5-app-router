import { UserInfo } from '@/components/user/profile/UserInfo';
import { currentSessionUser } from '@/lib/auth/auth-utils';

export default async function ServerPage() {
  const user = await currentSessionUser();

  return (
    <div className=''>
      <UserInfo label='💻Server component' user={user} />
    </div>
  );
}
