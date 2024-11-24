'use server';

import { PrismaClientKnownRequestError, PrismaClientInitializationError } from '@prisma/client/runtime/library';
import * as zod from 'zod';

import { generatePasswordResetToken } from '@/data/db/tokens/password-reset/create';
import { deletePasswordResetTokenById } from '@/data/db/tokens/password-reset/delete';
import { getUserResetPasswordData } from '@/data/db/user/reset-password';
import { CustomResetPasswordError } from '@/lib/constants/errors/errors';
import { messages } from '@/lib/constants/messages/actions/messages';
import { sendPasswordResetEmail } from '@/lib/mail/mail';
import { ResetPasswordSchema } from '@/schemas';

type ResetPasswordActionResult = { success: string; error?: never } | { error: string; success?: never };

/**
 * Server action to initiate password reset process
 *
 * Handles the first step of password reset where user requests a reset link.
 * Performs validations, generates a reset token, and sends an email
 * with the reset link to the user.
 *
 * 1. Validate email format
 * 2. Check if user exists and can reset password
 * 3. Check for existing valid reset tokens
 * 4. Generate new reset token
 * 5. Send reset email
 * 6. Clean up token if email fails
 *
 * @securityNotes
 * - Validates email format before processing
 * - Prevents multiple active reset tokens
 * - Deletes token if email sending fails
 * - Prevents OAuth-only accounts from password reset
 */
export const resetPasswordAction = async (
  values: zod.infer<typeof ResetPasswordSchema>
): Promise<ResetPasswordActionResult> => {
  try {
    const validatedFields = ResetPasswordSchema.safeParse(values);
    if (!validatedFields.success) {
      throw new CustomResetPasswordError('InvalidFields');
    }

    const { email } = validatedFields.data;

    const { userId, canResetPassword, activeResetToken } = await getUserResetPasswordData(email);

    if (!userId) {
      throw new CustomResetPasswordError('EmailNotFound');
    }

    if (!canResetPassword) {
      throw new CustomResetPasswordError('NoPasswordToReset');
    }

    if (activeResetToken) {
      throw new CustomResetPasswordError('TokenStillValid');
    }

    const passwordResetToken = await generatePasswordResetToken(email, userId);
    const emailResponse = await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token);
    if (emailResponse.error) {
      await deletePasswordResetTokenById(passwordResetToken.id);
      throw new CustomResetPasswordError('ResendEmailError');
    }
    return { success: messages.reset_password.success.PASSWORD_RESET_EMAIL_SENT };
  } catch (error) {
    if (error instanceof CustomResetPasswordError) {
      switch (error.type) {
        case 'InvalidFields':
          return { error: messages.reset_password.errors.INVALID_EMAIL };
        case 'EmailNotFound':
          return { error: messages.reset_password.errors.EMAIL_NOT_FOUND };
        case 'NoPasswordToReset':
          return { error: messages.reset_password.errors.OAUTH_USER_ONLY };
        case 'TokenStillValid':
          return { error: messages.reset_password.errors.TOKEN_STILL_VALID };
        case 'ResendEmailError':
          return { error: messages.reset_password.errors.SEND_EMAIL_ERROR };
        default:
          return { error: messages.generic.errors.UNKNOWN_ERROR };
      }
    }

    if (error instanceof PrismaClientKnownRequestError || error instanceof PrismaClientInitializationError) {
      console.error('Database error:', error);
      return { error: messages.generic.errors.DB_CONNECTION_ERROR };
    }

    return { error: messages.generic.errors.UNEXPECTED_ERROR };
  }
};
