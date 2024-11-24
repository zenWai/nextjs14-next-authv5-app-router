import { db } from '@/lib/db';

export const getCustomVerificationTokenByToken = async (token: string) => {
  const customVerificationToken = await db.customVerificationToken.findUnique({
    where: { token },
  });
  return customVerificationToken;
};
