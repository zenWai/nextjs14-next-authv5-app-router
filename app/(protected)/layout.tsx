import { Navbar } from '@/components/layout/Navbar';
import { NavigationMenu } from '@/components/layout/navbar/NavigationMenu';
import { UserAvatarMenu } from '@/components/layout/navbar/UserAvatarMenu';

import type { ReactNode } from 'react';

export default function ProtectedLayout(props: { children: ReactNode }) {
  return (
    <div className='flex min-h-svh w-full flex-col items-center gap-y-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800 py-5'>
      <Navbar>
        <NavigationMenu />
        <UserAvatarMenu />
      </Navbar>
      {props.children}
    </div>
  );
}
