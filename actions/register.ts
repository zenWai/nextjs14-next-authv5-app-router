'use server';

import * as zod from 'zod';
import bcrypt from 'bcryptjs';

import { getUserByEmail } from '@/data/user';
import { sendVerificationEmail } from '@/lib/mail';
import { RegisterSchema } from '@/schemas';
import { db } from '@/lib/db';
import { generateVerificationToken } from '@/lib/tokens';

export const register = async (values: zod.infer<typeof RegisterSchema>) => {
  const validatedFields = RegisterSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Invalid fields',
    };
  }

  const { email, password, name } = validatedFields.data;
  // auto generate salted hash
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingUser = await getUserByEmail(email);

  if (existingUser) {
    return { error: 'Email already registered!' };
  }

  await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const verificationToken = await generateVerificationToken(email);
  await sendVerificationEmail(verificationToken.email, verificationToken.token);

  return { success: 'Confirmation email sent!' };
};
