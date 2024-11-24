import { PasswordResetToken, Prisma } from '@prisma/client';

import { db } from '@/lib/db';

export const getPasswordResetTokenByToken = async (token: string): Promise<PasswordResetToken | null> => {
  const passwordToken = await db.passwordResetToken.findUnique({
    where: { token },
  });

  return passwordToken;
};

export const getPasswordResetTokenByEmail = async (email: string): Promise<PasswordResetToken | null> => {
  const passwordResetToken = await db.passwordResetToken.findUnique({
    where: { email },
  });

  return passwordResetToken;
};

type TokenWithUser = Prisma.PasswordResetTokenGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        email: true;
      };
    };
  };
}>;

/**
 * Retrieves a password reset token and its associated user information in a single query
 * @param {string} token - The password reset token string to look up
 * @returns {Promise<TokenWithUser | null>} The token with user data if found, null otherwise
 *
 * @throws Will throw an error if the database query fails
 */
export const getPasswordResetTokenWithUserByTokenId = async (token: string): Promise<TokenWithUser | null> => {
  return db.passwordResetToken.findUnique({
    where: {
      token,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Retrieves a valid (non-expired) password reset token
 * @param {string} token - The password reset token string to look up
 * @returns {Promise<PasswordResetToken | null>} The token if found and valid, null otherwise
 *
 * @throws - Will throw an error if the database query fails
 */
export const getValidPasswordResetToken = async (token: string): Promise<PasswordResetToken | null> => {
  const now = new Date();

  return db.passwordResetToken.findFirst({
    where: {
      token,
      expires: {
        gt: now,
      },
    },
  });
};
