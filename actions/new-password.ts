'use server';

import { PrismaClientKnownRequestError, PrismaClientInitializationError } from '@prisma/client/runtime/library';
import * as zod from 'zod';

import { getValidPasswordResetToken } from '@/data/db/tokens/password-reset/helpers';
import { CustomNewPasswordError } from '@/lib/constants/errors/errors';
import { messages } from '@/lib/constants/messages/actions/messages';
import { hashPassword } from '@/lib/crypto/hash-edge-compatible';
import { db } from '@/lib/db';
import { NewPasswordSchema, PasswordResetTokenSchema } from '@/schemas';

type NewPasswordActionResult = { success: string; error?: never } | { error: string; success?: never };

/**
 * Server action to handle password reset after user clicks email link
 *
 * This action is triggered when a user submits the new password form after clicking
 * the reset password link from their email. It validates the token from the URL
 *
 * @note Uses a database transaction to ensure token is invalidated when password is updated
 * @note Passwords are hashed before storage
 * @note Tokens are single-use and removed
 */
export const newPasswordAction = async (
  values: zod.infer<typeof NewPasswordSchema>,
  token?: string | null
): Promise<NewPasswordActionResult> => {
  try {
    // Validate inputs
    const validatedToken = PasswordResetTokenSchema.safeParse(token);
    if (!validatedToken.success || !validatedToken.data) {
      throw new CustomNewPasswordError('InvalidToken');
    }

    const validatedFields = NewPasswordSchema.safeParse(values);
    if (!validatedFields.success || !validatedFields.data) {
      throw new CustomNewPasswordError('InvalidFields');
    }

    const existingToken = await getValidPasswordResetToken(validatedToken.data);
    if (!existingToken) {
      throw new CustomNewPasswordError('TokenNotExist');
    }

    const { password } = validatedFields.data;
    // Hash the new password
    const hashedPassword = await hashPassword(password);

    // Update password and delete token to prevent token reuse
    await db.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: {
          id: existingToken.userId,
        },
        data: {
          password: hashedPassword,
        },
      });

      // Delete the used token
      await tx.passwordResetToken.delete({
        where: {
          id: existingToken.id,
        },
      });
    });

    return { success: messages.new_password.success.UPDATE_SUCCESSFUL };
  } catch (error) {
    if (error instanceof CustomNewPasswordError) {
      switch (error.type) {
        case 'InvalidToken':
          return { error: messages.new_password.errors.INVALID_TOKEN };
        case 'InvalidFields':
          return { error: messages.new_password.errors.INVALID_PASSWORD };
        case 'TokenNotExist':
          return { error: messages.new_password.errors.REQUEST_NEW_PASSWORD_RESET };
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
