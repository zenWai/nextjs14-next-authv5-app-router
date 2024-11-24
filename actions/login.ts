'use server';

import { PrismaClientKnownRequestError, PrismaClientInitializationError } from '@prisma/client/runtime/library';
import { AuthError } from 'next-auth';
import * as zod from 'zod';

import { signIn } from '@/auth';
import { generateTwoFactorToken } from '@/data/db/tokens/two-factor/create';
import { generateCustomVerificationToken } from '@/data/db/tokens/verification-email/create';
import { deleteCustomVerificationTokenById } from '@/data/db/tokens/verification-email/delete';
import { consumeTwoFactorToken, getUserLoginAuthData } from '@/data/db/user/login';
import { CustomLoginAuthError } from '@/lib/constants/errors/errors';
import { messages } from '@/lib/constants/messages/actions/messages';
import { verifyPassword } from '@/lib/crypto/hash-edge-compatible';
import { sendVerificationEmail, sendTwoFactorTokenEmail } from '@/lib/mail/mail';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { CallbackUrlSchema, LoginSchema } from '@/schemas';

import type { VerifiedUserForAuth } from '@/lib/auth/types';

type LoginActionResult =
  | { success: string; error?: never; twoFactor?: never }
  | { error: string; success?: never; twoFactor?: never }
  | { twoFactor: true; success?: never; error?: never };

/**
 * Server action to handle user authentication with support for 2FA and email verification
 *
 * Manages the complete login flow including credentials verification, 2FA handling,
 * email verification status, and proper session creation. Supports callback URLs
 * and handles various authentication scenarios.
 *
 * 1. Validate input fields and callback URL
 * 2. Fetch user authentication data
 * 3. Verify password
 *    - Check needs update to Reset Password
 * 4. Check email verification status
 *    - Send verification email if needed
 * 5. Handle 2FA if enabled
 *    - Generate and send 2FA token if needed
 *    - Send user to 2FA form
 *    - Verify 2FA code if provided
 * 6. Create authenticated session with auth.js
 *
 * @notes
 * - Successful login throws NEXT_REDIRECT (normal Auth.js behavior)
 * - 2FA tokens are single-use
 * - Email verification tokens are reissued if expired
 * - Supports custom callback URLs with validation
 */
export const loginAction = async (
  values: zod.infer<typeof LoginSchema>,
  callbackUrl: string | null
): Promise<LoginActionResult> => {
  try {
    const validatedFields = LoginSchema.safeParse(values);
    const validatedCallbackUrl = CallbackUrlSchema.safeParse(callbackUrl);

    if (!validatedFields.success) {
      throw new CustomLoginAuthError('InvalidFields');
    }

    callbackUrl = validatedCallbackUrl.success ? validatedCallbackUrl.data : null;
    const { email, password, twoFactorCode } = validatedFields.data;

    // Get all user auth data in a single query
    const { user, activeCustomVerificationToken, activeTwoFactorToken } = await getUserLoginAuthData(email);

    if (!user?.email || !user?.password) {
      throw new CustomLoginAuthError('WrongCredentials');
    }

    // Verify password, this handles crypto version changes
    const { isPasswordValid, passwordNeedsUpdate } = await verifyPassword(password, user.password);
    if (passwordNeedsUpdate) {
      throw new CustomLoginAuthError('PasswordNeedUpdate');
    }
    if (!isPasswordValid) {
      throw new CustomLoginAuthError('WrongCredentials');
    }

    // Handle email verification
    if (!user.emailVerified) {
      if (activeCustomVerificationToken) {
        throw new CustomLoginAuthError('ConfirmationEmailAlreadySent');
      }

      const customVerificationToken = await generateCustomVerificationToken({
        email,
        userId: user.id,
      });

      const emailResponse = await sendVerificationEmail(customVerificationToken.email, customVerificationToken.token);
      if (emailResponse.error) {
        await deleteCustomVerificationTokenById(customVerificationToken.id);
        throw new CustomLoginAuthError('ResendEmailError');
      }
      throw new CustomLoginAuthError('NewConfirmationEmailSent');
    }

    // Handle 2FA
    if (user.isTwoFactorEnabled) {
      if (twoFactorCode) {
        if (!activeTwoFactorToken) {
          throw new CustomLoginAuthError('TwoFactorTokenNotExists');
        }

        if (activeTwoFactorToken.token !== twoFactorCode) {
          throw new CustomLoginAuthError('TwoFactorCodeInvalid');
        }

        await consumeTwoFactorToken(activeTwoFactorToken.token, user.id);
      } else {
        // At this point user is logging in and have 2FA Activated
        if (!activeTwoFactorToken) {
          const twoFactorToken = await generateTwoFactorToken(user.email, user.id);
          const emailResponse = await sendTwoFactorTokenEmail(user.email, twoFactorToken.token);
          if (emailResponse.error) {
            throw new CustomLoginAuthError('ResendEmailError');
          }
        }
        // We send user to the 2FA Code Form
        return { twoFactor: true };
      }
    }
    const verifiedUser: VerifiedUserForAuth = {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      emailVerified: user.emailVerified,
      image: user.image,
      isOauth: false,
    };
    // Stringify user object since Auth.js credentials only accept strings
    // Will be JSON.parsed in the auth callback
    // by doing JSON.stringify, is easier to construct the object again.
    // Could use formData too
    await signIn('credentials', {
      user: JSON.stringify(verifiedUser),
      redirectTo: callbackUrl ?? DEFAULT_LOGIN_REDIRECT,
    });
  } catch (error) {
    if (error instanceof CustomLoginAuthError) {
      switch (error.type) {
        case 'InvalidFields':
          return { error: messages.login.errors.INVALID_FIELDS };
        case 'WrongCredentials':
          return { error: messages.login.errors.WRONG_CREDENTIALS };
        case 'ConfirmationEmailAlreadySent':
          return { error: messages.login.errors.CONFIRMATION_EMAIL_ALREADY_SENT };
        case 'ResendEmailError':
          return { error: messages.login.errors.RESEND_EMAIL_ERROR };
        case 'NewConfirmationEmailSent':
          return { error: messages.login.errors.NEW_CONFIRMATION_EMAIL_SENT };
        case 'TwoFactorTokenNotExists':
          return { error: messages.login.errors.TWO_FACTOR_TOKEN_NOT_EXISTS };
        case 'TwoFactorCodeInvalid':
          return { error: messages.login.errors.TWO_FACTOR_CODE_INVALID };
        case 'PasswordNeedUpdate':
          return { error: messages.login.errors.ASK_USER_RESET_PASSWORD };
        default:
          return { error: messages.generic.errors.UNKNOWN_ERROR };
      }
    }

    if (error instanceof PrismaClientKnownRequestError || error instanceof PrismaClientInitializationError) {
      console.error('Database error:', error);
      return { error: messages.generic.errors.DB_CONNECTION_ERROR };
    }

    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return { error: messages.login.errors.AUTH_ERROR };
        default:
          return { error: messages.login.errors.AUTH_ERROR };
      }
    }

    if (error instanceof Error && error.message?.includes('NEXT_REDIRECT')) {
      throw error; // This is necessary for the redirect to work
    }

    return { error: messages.generic.errors.UNEXPECTED_ERROR };
  }

  return { error: messages.generic.errors.NASTY_WEIRD_ERROR };
};
