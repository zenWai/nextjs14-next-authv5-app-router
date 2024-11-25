'use client';

import { logoutAction } from '@/actions/logout';

import type { ReactNode } from 'react';

export const LogoutButton = (props: { children: ReactNode }) => {
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
