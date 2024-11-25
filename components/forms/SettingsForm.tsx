'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { type Session } from 'next-auth';
import { useState, useTransition } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import * as zod from 'zod';

import { settingsAction } from '@/actions/settings';
import { FormError } from '@/components/forms/messages/FormError';
import { FormSuccess } from '@/components/forms/messages/FormSuccess';
import { Button } from '@/components/ui/button';
import { CustomSpinner } from '@/components/ui/CustomSpinner';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { SettingsSchema } from '@/schemas';

export const SettingsForm = ({ user }: { user: Session['user'] }) => {
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const defaultValues = {
    name: user?.name || '',
    email: user?.email || '',
    password: undefined,
    newPassword: undefined,
    role: user?.role || UserRole.USER,
    isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
  };

  const form = useForm<zod.infer<typeof SettingsSchema>>({
    resolver: zodResolver(SettingsSchema),
    defaultValues,
  });

  const onSubmit = (values: zod.infer<typeof SettingsSchema>) => {
    setError('');
    setSuccess('');
    startTransition(() => {
      settingsAction(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            setSuccess(data.success);
            router.refresh();
          }
        })
        .catch(() => setError('An error occurred!'));
    });
  };

  return (
    <>
      <Form {...form}>
        <form
          className={cn('space-y-6', isPending && 'cursor-not-allowed [&_*]:cursor-not-allowed')}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <div className='space-y-4'>
            <EmailField disabled={true} form={form} />
            <NameField disabled={!user || isPending} form={form} />
            <PasswordField disabled={!user || isPending} form={form} isOauthAccount={user.isOauth} />
            <NewPasswordField disabled={!user || isPending} form={form} isOauthAccount={user.isOauth} />
            <RoleField defaultValue={defaultValues.role} disabled={!user || isPending} form={form} />
            <TwoFactorField disabled={!user || isPending} form={form} isOauthAccount={user.isOauth} />
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type='submit'>
            {isPending ? <CustomSpinner /> : 'Save'}
          </Button>
        </form>
      </Form>
    </>
  );
};

const EmailField = ({
  form,
  disabled = true,
}: {
  form: UseFormReturn<zod.infer<typeof SettingsSchema>>;
  disabled?: boolean;
}) => {
  return (
    <FormField
      control={form.control}
      name='email'
      render={({ field }) => (
        <FormItem className={disabled ? 'cursor-not-allowed opacity-50 [&_*]:cursor-not-allowed' : ''}>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} disabled={disabled} placeholder='john.doe@example.com' type='email' />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const NameField = ({
  form,
  disabled = true,
}: {
  form: UseFormReturn<zod.infer<typeof SettingsSchema>>;
  disabled?: boolean;
}) => {
  return (
    <FormField
      control={form.control}
      name='name'
      render={({ field }) => (
        <FormItem className={disabled ? 'cursor-not-allowed opacity-50 [&_*]:cursor-not-allowed' : ''}>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input {...field} disabled={disabled} placeholder='John Doe' />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const PasswordField = ({
  form,
  isOauthAccount,
  disabled = true,
}: {
  form: UseFormReturn<zod.infer<typeof SettingsSchema>>;
  isOauthAccount: boolean;
  disabled?: boolean;
}) => {
  return (
    <FormField
      control={form.control}
      name='password'
      render={({ field }) => (
        <FormItem
          className={isOauthAccount || disabled ? 'cursor-not-allowed opacity-50 [&_*]:cursor-not-allowed' : ''}
        >
          <FormLabel>Password</FormLabel>
          {isOauthAccount && (
            <FormDescription className='text-sm text-muted-foreground'>
              Password cannot be changed when using OAuth
            </FormDescription>
          )}
          <FormControl>
            <Input
              {...field}
              disabled={isOauthAccount || disabled}
              onChange={(e) => {
                const value = e.target.value;
                const newValue = value === '' ? undefined : value;
                field.onChange(newValue);
                if (!newValue) {
                  form.setValue('newPassword', undefined);
                }
              }}
              placeholder='123456'
              type='password'
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const NewPasswordField = ({
  form,
  isOauthAccount,
  disabled = true,
}: {
  form: UseFormReturn<zod.infer<typeof SettingsSchema>>;
  isOauthAccount: boolean;
  disabled?: boolean;
}) => {
  const passwordFieldValue = form.watch('password');
  return (
    <FormField
      control={form.control}
      name='newPassword'
      render={({ field }) => (
        <FormItem
          className={
            isOauthAccount || disabled || !passwordFieldValue
              ? 'cursor-not-allowed opacity-50 [&_*]:cursor-not-allowed'
              : ''
          }
        >
          <FormLabel>New Password</FormLabel>
          <FormControl>
            <Input
              {...field}
              disabled={disabled || !passwordFieldValue}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === '' ? undefined : value);
              }}
              placeholder='123456'
              type='password'
              value={!passwordFieldValue ? '' : field.value}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const RoleField = ({
  form,
  disabled = true,
  defaultValue,
}: {
  form: UseFormReturn<zod.infer<typeof SettingsSchema>>;
  disabled?: boolean;
  defaultValue: UserRole;
}) => {
  return (
    <FormField
      control={form.control}
      name='role'
      render={({ field }) => (
        <FormItem className={disabled ? 'cursor-not-allowed opacity-50 [&_*]:cursor-not-allowed' : ''}>
          <FormLabel>Role</FormLabel>
          <Select defaultValue={defaultValue} disabled={disabled} onValueChange={field.onChange}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder='Select a role' />
              </SelectTrigger>
            </FormControl>
            <SelectContent aria-disabled={disabled}>
              <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
              <SelectItem value={UserRole.USER}>User</SelectItem>
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

const TwoFactorField = ({
  form,
  isOauthAccount,
  disabled = true,
}: {
  form: UseFormReturn<zod.infer<typeof SettingsSchema>>;
  isOauthAccount: boolean;
  disabled?: boolean;
}) => {
  return (
    <FormField
      control={form.control}
      name='isTwoFactorEnabled'
      render={({ field }) => (
        <FormItem
          className={cn(
            'flex flex-col justify-between rounded-lg border p-3 shadow-sm',
            (isOauthAccount || disabled) && 'cursor-not-allowed opacity-50 [&_*]:cursor-not-allowed'
          )}
        >
          <FormLabel>Two Factor Authentication</FormLabel>
          <FormControl>
            <Switch checked={field.value} disabled={disabled || isOauthAccount} onCheckedChange={field.onChange} />
          </FormControl>
          {isOauthAccount && (
            <FormDescription className={'text-sm text-muted-foreground'}>
              Not implemented for OAuthAccount
            </FormDescription>
          )}
        </FormItem>
      )}
    />
  );
};
