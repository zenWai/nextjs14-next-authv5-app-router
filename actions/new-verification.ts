'use server';

import { PrismaClientInitializationError, PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { generateCustomVerificationToken } from '@/data/db/tokens/verification-email/create';
import { deleteCustomVerificationTokenById } from '@/data/db/tokens/verification-email/delete';
import { CustomNewVerificationEmailError } from '@/lib/constants/errors/errors';
import { messages } from '@/lib/constants/messages/actions/messages';
import { db } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/mail/mail';
import { NewVerificationEmailTokenSchema } from '@/schemas';

type NewVerificationActionResult = { success: string; error?: never } | { error: string; success?: never };

/**
 * Server action to handle email verification token processing
 *
 * Validates and processes email verification tokens, handling various scenarios
 * including token expiration, already verified emails, and automatic token renewal.
 * Uses transactions to ensure data consistency when updating verification status.
 *
 * 1. Validate token format
 * 2. Find token in database with user data
 * 3. Check if email already verified
 * 4. Check token expiration
 *    - If expired, generate and send new token
 * 5. Update user verification status
 * 6. Delete used token
 */
export const newVerificationAction = async (token: string): Promise<NewVerificationActionResult> => {
  try {
    const validatedToken = NewVerificationEmailTokenSchema.safeParse(token);
    if (!validatedToken.success) {
      throw new CustomNewVerificationEmailError('InvalidToken');
    }

    const verificationData = await db.customVerificationToken.findUnique({
      where: {
        token: validatedToken.data,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            emailVerified: true,
          },
        },
      },
    });

    if (!verificationData) {
      throw new CustomNewVerificationEmailError('InvalidTokenOrVerified');
    }

    // Check if email is already verified
    // This should not happen
    if (verificationData.user.emailVerified) {
      await db.customVerificationToken.delete({
        where: { id: verificationData.id },
      });
      throw new CustomNewVerificationEmailError('EmailAlreadyVerified');
    }

    // Check if token has expired
    const now = new Date();
    if (verificationData.expires <= now) {
      const newToken = await generateCustomVerificationToken({
        userId: verificationData.user.id,
        email: verificationData.email,
      });

      // Send new verification email
      const emailResponse = await sendVerificationEmail(newToken.email, newToken.token);
      if (emailResponse.error) {
        await deleteCustomVerificationTokenById(newToken.id);
        throw new CustomNewVerificationEmailError('ResendEmailError');
      }
      throw new CustomNewVerificationEmailError('TokenExpiredSentNewEmail');
    }

    // Verify email and delete token
    await db.$transaction(async (tx) => {
      await tx.user.update({
        where: {
          id: verificationData.user.id,
        },
        data: {
          emailVerified: new Date(),
          email: verificationData.email,
        },
      });

      await tx.customVerificationToken.delete({
        where: {
          id: verificationData.id,
        },
      });
    });

    return { success: messages.new_verification_email.success.EMAIL_VERIFIED };
  } catch (error) {
    if (error instanceof CustomNewVerificationEmailError) {
      switch (error.type) {
        case 'InvalidToken':
          return { error: messages.new_verification_email.errors.INVALID_TOKEN };
        case 'EmailNotFound':
          return { error: messages.new_verification_email.errors.EMAIL_NOT_FOUND };
        case 'EmailAlreadyVerified':
          return { error: messages.new_verification_email.errors.EMAIL_ALREADY_VERIFIED };
        case 'ResendEmailError':
          return { error: messages.new_verification_email.errors.TOKEN_EXPIRED_FAILED_SEND_EMAIL };
        case 'TokenExpiredSentNewEmail':
          return { error: messages.new_verification_email.errors.TOKEN_EXPIRED_SENT_NEW };
        case 'InvalidTokenOrVerified':
          return { error: messages.new_verification_email.errors.INVALID_TOKEN_OR_VERIFIED };
        default:
          return { error: messages.generic.errors.UNKNOWN_ERROR };
      }
    }

    if (error instanceof PrismaClientInitializationError || error instanceof PrismaClientKnownRequestError) {
      console.error('Database error:', error);
      return { error: messages.generic.errors.DB_CONNECTION_ERROR };
    }

    console.error('Verification error:', error);
    return { error: messages.generic.errors.UNEXPECTED_ERROR };
  }
};
