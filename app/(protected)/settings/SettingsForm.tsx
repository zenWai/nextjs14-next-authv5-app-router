'use client';
import * as zod from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useTransition } from 'react';

import type { ExtendedUser } from '@/next-auth';
import { settings } from '@/actions/settings';
import { FormError } from '@/components/form-messages/FormError';
import { FormSuccess } from '@/components/form-messages/FormSuccess';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SettingsSchema } from '@/schemas';

export function SettingsForm({ user }: { user: ExtendedUser }) {
  const { update } = useSession();

  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

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

  useEffect(() => {
    if (user) {
      form.reset(defaultValues);
    }
  }, [user?.name, user?.email, user?.id, user?.image, user?.isOauth, user?.isTwoFactorEnabled, user?.role, form.reset]);

  const onSubmit = (values: zod.infer<typeof SettingsSchema>) => {
    setError('');
    setSuccess('');
    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            // updates client side session
            update();
            setSuccess(data.success);
          }
        })
        .catch(() => setError('An error occurred!'));
    });
  };
  return (
    <>
      <Form {...form}>
        <form className='space-y-6' onSubmit={form.handleSubmit(onSubmit)}>
          <div className='space-y-4'>
            {/* Name */}
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={!user || isPending} placeholder='John Doe' />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Content not shown to oauth users */}
            {/* Email and Password */}
            {user?.isOauth === false && (
              <>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          disabled={!user || isPending}
                          placeholder='john.doe@example.com'
                          type='email'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!user || isPending} placeholder='123456' type='password' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='newPassword'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={!user || isPending} placeholder='123456' type='password' />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            {/* Role */}
            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    // need to set the default value does not come from form defaults
                    defaultValue={defaultValues.role}
                    disabled={isPending}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select a role' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                      <SelectItem value={UserRole.USER}>User</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Two Factor Authentication not shown to oauth users */}
            {user?.isOauth === false && (
              <FormField
                control={form.control}
                name='isTwoFactorEnabled'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
                    <div className='space-y-5'>
                      <FormLabel>Two Factor Authentication</FormLabel>
                      <FormDescription>Enable Two Factor Authentication for your account</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} disabled={isPending} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
          </div>
          <FormError message={error} />
          <FormSuccess message={success} />
          <Button disabled={isPending} type='submit'>
            Save
          </Button>
        </form>
      </Form>
    </>
  );
}
