import { PasswordResetToken } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { db } from '@/lib/db';

export const generatePasswordResetToken = async (email: string, userId: string): Promise<PasswordResetToken> => {
  const token = uuidv4();
  const expires = new Date(new Date().getTime() + 3600 * 1000); // 1hr

  // Clean up any existing tokens for this email
  await db.passwordResetToken.deleteMany({
    where: { email },
  });

  const passwordResetToken = await db.passwordResetToken.upsert({
    where: {
      email,
    },
    update: {
      token,
      expires,
      userId,
    },
    create: {
      email,
      token,
      expires,
      userId,
    },
  });

  return passwordResetToken;
};
