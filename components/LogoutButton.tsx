'use client';
import { signOut } from 'next-auth/react';

export function LogoutButton(props: { children: React.ReactNode }) {
  return (
    <span className='cursor-pointer' onClick={() => signOut()}>
      {props.children}
    </span>
  );
}
