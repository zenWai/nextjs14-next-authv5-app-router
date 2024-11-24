import { TwoFactorToken } from '@prisma/client';

import { db } from '@/lib/db';

export const getTwoFactorTokenByToken = async (token: string): Promise<TwoFactorToken | null> => {
  const twoFactorToken = await db.twoFactorToken.findUnique({
    where: { token },
  });
  return twoFactorToken;
};

export const getTwoFactorTokenByEmail = async (email: string): Promise<TwoFactorToken | null> => {
  const twoFactorToken = await db.twoFactorToken.findFirst({
    where: { email },
  });
  return twoFactorToken;
};
