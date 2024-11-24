import crypto from 'crypto';

import { TwoFactorToken } from '@prisma/client';

import { getTwoFactorTokenByEmail } from '@/data/db/tokens/two-factor/helpers';
import { db } from '@/lib/db';

export const generateTwoFactorToken = async (email: string, userId: string): Promise<TwoFactorToken> => {
  const token = crypto.randomInt(100_000, 1_000_000).toString();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1hr

  const existingToken = await getTwoFactorTokenByEmail(email);
  if (existingToken) {
    await db.twoFactorToken.delete({
      where: { id: existingToken.id },
    });
  }

  const twoFactorToken = await db.twoFactorToken.create({
    data: {
      email,
      token,
      expires,
      userId,
    },
  });

  return twoFactorToken;
};
