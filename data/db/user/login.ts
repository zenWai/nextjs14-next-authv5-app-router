import { db } from '@/lib/db';

import type { TwoFactorConfirmation, TwoFactorToken, User, CustomVerificationToken } from '@prisma/client';

//Complete user data with authentication-related associations
interface UserLoginAuthData {
  user: CompleteUserWithAuth | null;
  activeCustomVerificationToken: CustomVerificationToken | null;
  activeTwoFactorToken: TwoFactorToken | null;
}

// Combined user authentication data
type CompleteUserWithAuth = User & {
  customVerificationTokens: CustomVerificationToken[];
  twoFactorTokens: TwoFactorToken[];
  twoFactorConfirmation: TwoFactorConfirmation | null;
};

/**
 * Retrieves all authentication-related data for a user
 *
 * Fetches user data along with their active verification tokens and 2FA status.
 * Only returns one non-expired tokens, ordered by expiration date.
 *
 * @note
 * - Tokens are filtered by expiration date
 * - Returns only the most recent tokens (ordered by expiration)
 * - Returns null values if user not found
 */
export const getUserLoginAuthData = async (email: string): Promise<UserLoginAuthData> => {
  const now = new Date(Date.now());
  const userData = await db.user.findUnique({
    where: { email },
    include: {
      customVerificationTokens: {
        where: {
          expires: { gt: now },
        },
        orderBy: {
          expires: 'desc',
        },
      },
      twoFactorTokens: {
        where: {
          expires: { gt: now },
        },
        orderBy: {
          expires: 'desc',
        },
      },
      twoFactorConfirmation: true,
    },
  });

  if (!userData) {
    return {
      user: null,
      activeCustomVerificationToken: null,
      activeTwoFactorToken: null,
    };
  }

  const [customVerificationToken] = userData.customVerificationTokens;
  const [twoFactorToken] = userData.twoFactorTokens;
  return {
    user: userData,
    activeCustomVerificationToken: customVerificationToken || null,
    activeTwoFactorToken: twoFactorToken || null,
  };
};

/**
 * Processes a successful 2FA verification
 *
 * Handles the complete 2FA verification flow in a transaction:
 * 1. Deletes the used 2FA token
 * 2. Removes any existing 2FA confirmations
 * 3. Creates a new 2FA confirmation
 *
 * @throws {PrismaClientKnownRequestError}
 * - If token doesn't exist
 * - If user doesn't exist
 * - If database transaction fails
 */
export const consumeTwoFactorToken = async (token: string, userId: string): Promise<void> => {
  await db.$transaction(async (tx) => {
    // Delete the used token
    await tx.twoFactorToken.delete({
      where: { token: token },
    });

    await tx.twoFactorConfirmation.deleteMany({
      where: { userId },
    });

    // Create new confirmation
    await tx.twoFactorConfirmation.create({
      data: { userId },
    });
  });
};
