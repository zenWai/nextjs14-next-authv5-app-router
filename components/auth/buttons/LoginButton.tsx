'use client';

import { useRouter } from 'next/navigation';

import { LoginForm } from '@/components/auth/forms/LoginForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

import type { ReactNode } from 'react';

interface LoginButtonProps {
  children: ReactNode;
  mode?: 'modal' | 'redirect';
  asChild?: boolean;
}

export const LoginButton = ({ children, mode = 'redirect', asChild }: LoginButtonProps) => {
  const router = useRouter();

  const onClick = () => {
    router.push('/login');
  };

  if (mode === 'modal') {
    return (
      <Dialog>
        <DialogTrigger asChild={asChild}>{children}</DialogTrigger>
        <DialogContent className='w-auto border-none bg-transparent p-0'>
          <LoginForm />
        </DialogContent>
      </Dialog>
    );
  }
  return (
    <span className='cursor-pointer' onClick={onClick}>
      {children}
    </span>
  );
};
