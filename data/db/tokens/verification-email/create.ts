import { CustomVerificationToken, Prisma } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/db';

/**
 * Generates a verification token for a user
 * Uses upsert with compound unique constraint
 *
 * @param {Object} params - The parameters for token generation
 * @param {string} params.userId - User's ID
 * @param {string} params.email - User's email
 * @param {Prisma.TransactionClient} [params.prisma=db] - Optional transaction client defaults to db from @/lib/db
 * @returns {Promise<CustomVerificationToken>} The created verification token
 */
export const generateCustomVerificationToken = async ({
  userId,
  email,
  prisma = db,
}: {
  userId: string;
  email: string;
  prisma?: typeof db | Prisma.TransactionClient;
}): Promise<CustomVerificationToken> => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1hr

  // First, delete any existing tokens for this email
  await prisma.customVerificationToken.deleteMany({
    where: { email },
  });

  // Then create a new token
  return prisma.customVerificationToken.create({
    data: {
      email,
      token,
      expires,
      userId,
    },
  });
};
