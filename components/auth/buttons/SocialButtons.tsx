'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { ImMail4 } from 'react-icons/im';

import { Button } from '@/components/ui/button';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';

export const SocialButtons = () => {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const onClick = (provider: 'google' | 'github') => {
    signIn(provider, {
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  };
  return (
    <div className='grid w-full grid-cols-1 items-center gap-2'>
      <div className='grid grid-cols-2 gap-x-2'>
        <Button className='w-full' onClick={() => onClick('google')} size='lg' variant='outline'>
          <FcGoogle className='h-5 w-5' />
        </Button>
        <Button className='w-full' onClick={() => onClick('github')} size='lg' variant='outline'>
          <FaGithub className='h-5 w-5' />
        </Button>
      </div>
      <Link href='/login/magic-link'>
        <Button className='w-full' size='lg' variant='secondary'>
          <ImMail4 />
          Login with mail
        </Button>
      </Link>
    </div>
  );
};
