import { Poppins } from 'next/font/google';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LoginButton } from '@/components/auth/LoginButton';

const font = Poppins({
  subsets: ['latin'],
  weight: ['600'],
});
export default function Home() {
  return (
    <main
      className='flex h-full flex-col items-center justify-center
    bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800'
    >
      <div className='space-y-6 text-center'>
        <h1 className={cn('text-6xl font-semibold text-white drop-shadow-md', font.className)}>
          <span aria-label='icon' role='img'>
            🔐
          </span>{' '}
          Auth
        </h1>
        <p className='text-lg text-white'>Authentication</p>
        <div>
          <LoginButton asChild mode='modal'>
            <Button size='lg' variant='secondary'>
              Sign in
            </Button>
          </LoginButton>
        </div>
      </div>
    </main>
  );
}
