'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';

export const NavigationMenu = () => {
  const pathname = usePathname();
  return (
    <div className='flex gap-x-2'>
      <Button asChild variant={pathname === '/server' ? 'default' : 'outline'}>
        <Link href='/server' prefetch={false}>
          Server
        </Link>
      </Button>
      <Button asChild variant={pathname === '/client' ? 'default' : 'outline'}>
        <Link href='/client' prefetch={false}>
          Client
        </Link>
      </Button>
      <Button asChild variant={pathname === '/admin' ? 'default' : 'outline'}>
        <Link href='/admin' prefetch={false}>
          Admin
        </Link>
      </Button>
      <Button asChild variant={pathname === '/settings' ? 'default' : 'outline'}>
        <Link href='/settings' prefetch={false}>
          Settings
        </Link>
      </Button>
    </div>
  );
};
