import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

import { CardWrapper } from '@/components/auth/CardWrapper';

export function ErrorCard() {
  return (
    <CardWrapper headerLabel='Oops! Something went wrong!' backButtonLabel='Back to login' backButtonHref='/login'>
      <div className='flex w-full items-center justify-center'>
        <ExclamationTriangleIcon className='text-destructive' />
      </div>
    </CardWrapper>
  );
}
