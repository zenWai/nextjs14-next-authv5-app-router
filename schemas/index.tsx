import * as zod from 'zod';

export const LoginSchema = zod.object({
  email: zod.string().email({
    message: 'Email is required',
  }),
  password: zod.string().min(1, { message: 'Password is required' }),
  code: zod.optional(zod.string()),
});

export const RegisterSchema = zod.object({
  email: zod.string().email({
    message: 'Email is required',
  }),
  password: zod.string().min(6, { message: 'Password is required' }),
  name: zod.string().min(1, { message: 'Name is required' }),
});

export const ResetPasswordSchema = zod.object({
  email: zod.string().email({
    message: 'Email is required',
  }),
});

export const NewPasswordSchema = zod.object({
  password: zod.string().min(6, { message: 'Minimum of 6 characters required' }),
});
