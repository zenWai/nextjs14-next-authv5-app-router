import { db } from '@/lib/db';

import type { PasswordResetToken, User } from '@prisma/client';

type UserResetPasswordData = {
  userId: User['id'] | null;
  canResetPassword: boolean;
  activeResetToken: PasswordResetToken | null;
};

/**
 * Retrieves user data for password reset flow
 *
 * Fetches necessary user information to determine if and how a password reset
 * can proceed. Checks for existing valid reset tokens and whether the user
 * is eligible for password reset.
 *
 * @param {string} email - User's email address
 *
 * @returns {Promise<UserResetPasswordData>} Object containing:
 * - userId: User's ID if found
 * - canResetPassword: Whether user can reset password (has password auth)
 * - activeResetToken: Currently active reset token, if any
 *
 * @Notes
 * - Only returns one active (non-expired) reset tokens
 * - Orders tokens by expiration to get most recent
 * - Checks if user has password-based authentication
 *
 * @returns {Promise<{
 *   userId: string | null;
 *   canResetPassword: boolean;
 *   activeResetToken: PasswordResetToken | null;
 * }>}
 */
export const getUserResetPasswordData = async (email: string): Promise<UserResetPasswordData> => {
  const now = new Date();

  const userData = await db.user.findUnique({
    where: { email },
    select: {
      id: true,
      password: true,
      passwordResetTokens: {
        where: {
          expires: { gt: now },
        },
        orderBy: {
          expires: 'desc',
        },
        take: 1,
      },
    },
  });

  if (!userData) {
    return {
      userId: null,
      canResetPassword: false,
      activeResetToken: null,
    };
  }
  const canResetPassword = userData.password !== null;
  const [passwordResetToken] = userData.passwordResetTokens;

  return {
    userId: userData.id,
    canResetPassword,
    activeResetToken: passwordResetToken || null,
  };
};
