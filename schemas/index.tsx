import { UserRole } from '@prisma/client';
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

export const SettingsSchema = zod
  .object({
    name: zod.optional(zod.string().min(1)),
    isTwoFactorEnabled: zod.optional(zod.boolean()),
    role: zod.enum([UserRole.ADMIN, UserRole.USER]),
    email: zod.optional(zod.string().email()),
    password: zod.optional(zod.string().min(6)),
    newPassword: zod.optional(zod.string().min(6)),
  })
  .refine(
    (data) => {
      if (data.password && !data.newPassword) {
        return false;
      }

      return true;
    },
    {
      message: 'New Password is required!',
      path: ['newPassword'],
    }
  )
  .refine(
    (data) => {
      if (data.newPassword && !data.password) {
        return false;
      }

      return true;
    },
    {
      message: 'Password is required!',
      path: ['password'],
    }
  );
