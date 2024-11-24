import { UserRole } from '@prisma/client';
import * as zod from 'zod';

import { ALLOWED_REDIRECTS } from '@/routes';

const baseEmailSchema = zod
  .string()
  .min(1, { message: 'Email cannot be empty' })
  .trim()
  .toLowerCase()
  .email({ message: 'Invalid email address' })
  .max(62, { message: 'Email is too long' }); // can go to 255 db limit? but, no

const basePasswordSchema = zod
  .string()
  .min(1, { message: 'Password cannot be empty' })
  .trim()
  .min(6, { message: 'Password must be at least 6 characters' })
  .max(62, { message: 'Password is too long' }) // can go to 256 with crypto web api but, no
  .regex(/\S/, { message: 'Password cannot be only whitespaces' })
  .transform((value) => value.trim());

const baseNameSchema = zod
  .string()
  .min(1, { message: 'Empty' })
  .max(62, { message: 'Name is too long' })
  .trim()
  .regex(/\S/, { message: 'Name cannot be only whitespaces' }) // remove all whitespaces or tabs
  .transform((value) => value.trim().replace(/\s+/g, ' ')); // remove double spaces between names

export const MagicLinkSchema = zod.object({
  email: baseEmailSchema,
});

export const LoginSchema = zod.object({
  email: baseEmailSchema,
  password: basePasswordSchema,
  twoFactorCode: zod
    .string()
    .trim()
    .regex(/^\d{6}$/, { message: 'Code must be 6 digits' })
    .optional(),
});

export const CallbackUrlSchema = zod
  .string()
  .nullish()
  .transform((url) => {
    if (!url) return null;

    try {
      const decodedUrl = decodeURIComponent(url);
      return ALLOWED_REDIRECTS.includes(decodedUrl) ? decodedUrl : null;
    } catch {
      return null;
    }
  });

export const RegisterSchema = zod.object({
  email: baseEmailSchema,
  password: basePasswordSchema,
  name: baseNameSchema,
});

export const ResetPasswordSchema = zod.object({
  email: baseEmailSchema,
});

export const NewPasswordSchema = zod.object({
  password: basePasswordSchema,
});

export const PasswordResetTokenSchema = zod.string().uuid().nullish();

export const NewVerificationEmailTokenSchema = zod.string().uuid();

export const SettingsSchema = zod
  .object({
    name: baseNameSchema.optional(),
    isTwoFactorEnabled: zod.optional(zod.boolean()),
    role: zod.enum([UserRole.ADMIN, UserRole.USER]),
    email: baseEmailSchema.optional(),
    password: basePasswordSchema.optional(),
    newPassword: basePasswordSchema.optional(),
  })
  .refine((data) => !data.password || data.newPassword, {
    message: 'New password is required when changing password',
    path: ['newPassword'],
  })
  .refine((data) => !data.newPassword || data.password, {
    message: 'Current password is required when setting new password',
    path: ['password'],
  })
  .refine(
    (data) => {
      if (data.password && data.newPassword) {
        return data.password.trim() !== data.newPassword.trim();
      }
      return true;
    },
    {
      message: 'New password must be different from current password',
      path: ['newPassword'],
    }
  );

export const VerifiedCredentialsUserSchema = zod.object({
  id: zod.string().min(1),
  email: zod.string().email(),
  name: zod.string().nullable().optional(),
  role: zod.nativeEnum(UserRole),
  isTwoFactorEnabled: zod.boolean(),
  emailVerified: zod
    .string()
    .nullable()
    .optional()
    .transform((str) => (str ? new Date(str) : null)),
  image: zod.string().nullable().optional(),
  isOauth: zod.boolean(),
});
