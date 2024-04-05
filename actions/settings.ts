'use server';

import bcrypt from 'bcryptjs';
import * as zod from 'zod';

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

  if (!dbUser) {
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

    const verificationToken = await generateVerificationToken(values.email);

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
