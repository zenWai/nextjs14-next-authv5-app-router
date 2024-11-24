'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRef, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import * as zod from 'zod';

import { magicLinkAction } from '@/actions/magic-link';
import { CardWrapper } from '@/components/auth/shared/CardWrapper';
import { FormError } from '@/components/forms/messages/FormError';
import { FormSuccess } from '@/components/forms/messages/FormSuccess';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { MagicLinkSchema } from '@/schemas';

export const MagicLinkForm = () => {
  const [error, setError] = useState<string | undefined>('');
  const [success, setSuccess] = useState<string | undefined>('');
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<zod.infer<typeof MagicLinkSchema>>({
    resolver: zodResolver(MagicLinkSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = () => {
    setError('');
    setSuccess('');

    if (!formRef.current) return;

    startTransition(() => {
      // This lives here as an example of handling as FormData
      // and passing it to Server Action
      const formData = new FormData(formRef.current!);

      magicLinkAction(formData)
        .then((data) => {
          if (data?.error) {
            setError(data.error);
          }

          if (data?.success) {
            form.reset();
            setSuccess(data.success);
          }
        })
        .catch(() => {
          setError('Something went wrong');
        });
    });
  };

  return (
    <CardWrapper
      backButtonHref='/login'
      backButtonLabel='Login with other options?'
      headerLabel='Receive a link on your email to login'
    >
      <Form {...form}>
        <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)} ref={formRef}>
          <div className='space-y-6'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isPending} placeholder='john.doe@example.com' type='email' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button className='w-full' disabled={isPending} size='lg' type='submit' variant='outline'>
            Signin with Magic Link
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
};
