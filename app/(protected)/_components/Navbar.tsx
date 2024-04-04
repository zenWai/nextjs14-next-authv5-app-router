'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { UserButton } from '@/components/auth/UserButton';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className='flex w-[600px] items-center justify-between rounded-xl bg-secondary p-4 shadow-sm'>
      <div className='flex gap-x-2'>
        <Button asChild variant={pathname === '/server' ? 'default' : 'outline'}>
          <Link href='/server'>Server</Link>
        </Button>
        <Button asChild variant={pathname === '/client' ? 'default' : 'outline'}>
          <Link href='/client'>Client</Link>
        </Button>
        <Button asChild variant={pathname === '/admin' ? 'default' : 'outline'}>
          <Link href='/admin'>Admin</Link>
        </Button>
        <Button asChild variant={pathname === '/settings' ? 'default' : 'outline'}>
          <Link href='/settings'>Settings</Link>
        </Button>
      </div>
      <UserButton />
    </nav>
  );
}
