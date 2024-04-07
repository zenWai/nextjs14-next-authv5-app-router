'use server';

import bcrypt from 'bcryptjs';
import * as zod from 'zod';

import { getVerificationTokenByEmail, getVerificationTokenByWhoRequested } from '@/data/verification-token';
import { unstable_update } from '@/auth';
import { getUserByEmail, getUserById } from '@/data/user';
import { currentSessionUser } from '@/lib/auth-utils';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/mail';
import { generateVerificationToken } from '@/lib/tokens';
import { SettingsSchema } from '@/schemas';

export const settings = async (values: zod.infer<typeof SettingsSchema>) => {
  const user = await currentSessionUser();
  if (!user?.id) {
    return { error: 'Unauthorized!' };
  }

  const dbUser = await getUserById(user.id);

  if (!dbUser?.email) {
    return { error: 'Unauthorized!' };
  }

  const validatedFields = SettingsSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  /* Fields that users from oauth should not be able to change */
  if (user.isOauth) {
    values.email = undefined;
    values.password = undefined;
    values.newPassword = undefined;
    values.isTwoFactorEnabled = undefined;
  }

  /* Email change logic */
  if (values.email && values.email !== user.email) {
    const existingUser = await getUserByEmail(values.email);

    if (existingUser && existingUser.id !== user.id) {
      return { error: 'Email already in use!' };
    }

    /* Grace period before user can request new verification token */
    const existingVerificationToken = await getVerificationTokenByEmail(values.email);
    if (existingVerificationToken) {
      const hasExpired = new Date(existingVerificationToken.expires) < new Date();
      if (!hasExpired) {
        return { error: 'Verification email already sent! Confirm your inbox!' };
      }
    }

    /* Grace period before user can request new email change */
    const verificationTokenByRequest_email_change_by = await getVerificationTokenByWhoRequested(dbUser.email);
    if (verificationTokenByRequest_email_change_by) {
      const hasExpired = new Date(verificationTokenByRequest_email_change_by.expires) < new Date();
      if (!hasExpired) {
        return { error: 'You have already requested to change your email! You need to wait 1hour to change again' };
      }
    }

    const verificationToken = await generateVerificationToken(values.email, dbUser.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return { success: 'Verification email sent!' };
  }

  /* Password change logic */
  if (values.password && values.newPassword && dbUser.password) {
    const passwordsMatch = await bcrypt.compare(values.password, dbUser.password);

    if (!passwordsMatch) {
      return { error: 'Incorrect Password!' };
    }

    const hashedPassword = await bcrypt.hash(values.newPassword, 10);

    values.password = hashedPassword;
    values.newPassword = undefined;
  }

  const updatedUser = await db.user.update({
    where: { id: dbUser.id },
    data: { ...values },
  });

  await unstable_update({ user: { ...updatedUser } });

  return { success: 'Settings updated!' };
};
