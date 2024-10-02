'use server';

import { AuthError } from 'next-auth';
import * as zod from 'zod';
import bcrypt from 'bcryptjs';

import { getVerificationTokenByEmail } from '@/data/verification-token';
import { getTwoFactorConfirmationByUserId } from '@/data/two-factor-confirmation';
import { getTwoFactorTokenByEmail } from '@/data/two-factor-token';
import { db } from '@/lib/db';
import { getUserByEmail } from '@/data/user';
import { sendVerificationEmail, sendTwoFactorTokenEmail } from '@/lib/mail';
import { generateVerificationToken, generateTwoFactorToken } from '@/lib/tokens';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { LoginSchema } from '@/schemas';
import { signIn } from '@/auth';

export const login = async (values: zod.infer<typeof LoginSchema>, callbackUrl?: string | null) => {
  const validatedFields = LoginSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Invalid fields!' };
  }

  const { email, password, code } = validatedFields.data;

  const existingUser = await getUserByEmail(email);
  if (!existingUser || !existingUser.email || !existingUser.password) {
    return { error: 'Invalid credentials' };
  }

  // Verify password before proceeding with any other checks
  const passwordsMatch = await bcrypt.compare(password, existingUser.password);
  if (!passwordsMatch) {
    return { error: 'Invalid credentials' };
  }

  /** Confirmation email token recently sent?
   *  if not, generates and send email
   */
  if (!existingUser.emailVerified) {
    const existingToken = await getVerificationTokenByEmail(email);
    if (existingToken) {
      const hasExpired = new Date(existingToken.expires) < new Date();
      if (!hasExpired) {
        return { error: 'Confirmation email already sent! Check your inbox!' };
      }
    }

    const verificationToken = await generateVerificationToken(email);

    await sendVerificationEmail(verificationToken.email, verificationToken.token);

    return { success: 'Confirmation email sent!' };
  }

  /** 2FA code logic
   * Currently if current token is unexpired it does not re-send a new one
   * Reduce db calls and e-mail sents on this preview
   */
  if (existingUser.isTwoFactorEnabled && existingUser.email) {
    // If user is already at the 2fa on loginForm
    if (code) {
      const twoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
      if (!twoFactorToken) {
        return { error: 'Invalid two factor token' };
      }

      if (twoFactorToken.token !== code) {
        return { error: 'Invalid code' };
      }

      const hasExpired = new Date(twoFactorToken.expires) < new Date();
      if (hasExpired) {
        return { error: 'Code expired!' };
      }

      await db.twoFactorToken.delete({
        where: { id: twoFactorToken.id },
      });

      const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id);
      if (existingConfirmation) {
        await db.twoFactorConfirmation.delete({
          where: { id: existingConfirmation.id },
        });
      }
      // consumed by the signIn callback
      await db.twoFactorConfirmation.create({
        data: { userId: existingUser.id },
      });
    } else {
      // return { twoFactor: true }; sends the user to the 2fa on loginForm
      const existingTwoFactorToken = await getTwoFactorTokenByEmail(existingUser.email);
      if (existingTwoFactorToken) {
        const hasExpired = new Date(existingTwoFactorToken.expires) < new Date();
        if (!hasExpired) {
          return { twoFactor: true };
        }
      }
      const twoFactorToken = await generateTwoFactorToken(existingUser.email);

      await sendTwoFactorTokenEmail(existingUser.email, twoFactorToken.token);

      return { twoFactor: true };
    }
  }

  try {
    await signIn('credentials', {
      email,
      password,
      redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: 'Invalid credentials' };
        default:
          return { error: 'An error occurred' };
      }
    }

    throw error;
  }

  return { error: 'Something went wrong!' };
};
