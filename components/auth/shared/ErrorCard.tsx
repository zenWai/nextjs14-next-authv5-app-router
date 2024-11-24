import { ExclamationTriangleIcon } from '@radix-ui/react-icons';

import { CardWrapper } from '@/components/auth/shared/CardWrapper';

export const ErrorCard = () => {
  return (
    <CardWrapper backButtonHref='/login' backButtonLabel='Back to login' headerLabel='Oops! Something went wrong!'>
      <div className='flex w-full items-center justify-center'>
        <ExclamationTriangleIcon className='text-destructive' />
      </div>
    </CardWrapper>
  );
};
