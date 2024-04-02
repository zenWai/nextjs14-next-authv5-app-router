import { Poppins } from 'next/font/google';

import { cn } from '@/lib/utils';

const font = Poppins({ subsets: ['latin'], weight: '600' });

interface CardHeaderProps {
  label: string;
}

export function Header({ label }: CardHeaderProps) {
  return (
    <div className='flex w-full flex-col items-center justify-center gap-y-4'>
      <h1 className={cn('text-3xl font-semibold', font.className)}>
        <span role='img' aria-label='icon'>
          🔐
        </span>{' '}
        Auth
      </h1>
      <p className='text-sm text-muted-foreground'>{label}</p>
    </div>
  );
}
