'use client';

import { logoutAction } from '@/actions/logout';

export const LogoutButton = (props: { children: React.ReactNode }) => {
  return (
    <span
      className='cursor-pointer'
      onClick={async () => {
        await logoutAction();
      }}
    >
      {props.children}
    </span>
  );
};
