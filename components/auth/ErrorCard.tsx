import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

import { CardWrapper } from '@/components/auth/CardWrapper';

export function ErrorCard() {
  return (
    <CardWrapper backButtonHref='/login' backButtonLabel='Back to login' headerLabel='Oops! Something went wrong!'>
      <div className='flex w-full items-center justify-center'>
        <ExclamationTriangleIcon className='text-destructive' />
      </div>
    </CardWrapper>
  );
}
