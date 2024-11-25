import type { ReactNode } from 'react';

export const Navbar = ({ children }: { children: ReactNode }) => {
  return (
    <nav className='flex w-[600px] items-center justify-between rounded-xl bg-secondary p-4 shadow-sm'>{children}</nav>
  );
};
