'use client';

import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { BeatLoader } from 'react-spinners';

import { newVerificationAction } from '@/actions/new-verification';
import { CardWrapper } from '@/components/auth/shared/CardWrapper';
import { FormError } from '@/components/forms/messages/FormError';
import { FormSuccess } from '@/components/forms/messages/FormSuccess';

export const NewVerificationForm = () => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const verificationRequested = useRef(false);

  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const onSubmit = useCallback(() => {
    if (verificationRequested.current || success || error) return;
    verificationRequested.current = true;

    if (!token) {
      setError('Invalid token!');
      return;
    }

    newVerificationAction(token)
      .then((data) => {
        setSuccess(data.success);
        setError(data.error);
        verificationRequested.current = false;
      })
      .catch(() => {
        setError('Something went wrong while verifying token!');
        verificationRequested.current = false;
      });
  }, [token, success, error]);

  useEffect(() => {
    onSubmit();
  });

  return (
    <CardWrapper backButtonHref='/login' backButtonLabel='Back to login' headerLabel='Confirming your verification'>
      <div className='flex w-full items-center justify-center'>
        {!success && !error && <BeatLoader />}
        <FormSuccess message={success} />
        <FormError message={error} />
      </div>
    </CardWrapper>
  );
};
