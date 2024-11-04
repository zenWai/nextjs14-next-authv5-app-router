'use server';

import { headers } from 'next/headers';
import * as zod from 'zod';
import bcrypt from 'bcryptjs';

import { hashIp } from '@/lib/auth-utils';
import { getUserByEmail } from '@/data/user';
import { sendVerificationEmail } from '@/lib/mail';
import { RegisterSchema } from '@/schemas';
import { db } from '@/lib/db';
import { generateVerificationToken } from '@/lib/tokens';

export const register = async (values: zod.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) return { error: 'Invalid fields' };

  const { email, password, name } = validatedFields.data;

  const headersList = headers();
  const userIp = headersList.get('request-ip');
  const hashedIp = await hashIp(userIp);

  /* If we can not determine the IP of the user, fails to register */
  if ((process.env.NODE_ENV === 'production' && userIp === '127.0.0.1') || !userIp || hashedIp === 'unknown') {
    return { error: 'Sorry! Something went wrong. Could not identify you as user' };
  }

  const existingAccounts = await db.user.count({
    where: { ip: hashedIp },
  });
  if (process.env.NODE_ENV === 'production' && existingAccounts >= 2) {
    return { error: 'You are not allowed to register more accounts on this app preview' };
  }

  //TODO: Single Query Approach using Prisma Error code or upsert approach
  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    return { error: 'Email already registered!' };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const createdUser = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      ip: hashedIp,
    },
    select: {
      id: true,
      email: true,
    },
  });

  if (!createdUser?.id || !createdUser?.email) return { error: 'Something went wrong!' };

  const verificationToken = await generateVerificationToken(createdUser.email, createdUser.id);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: 'Confirmation email sent!' };
};
