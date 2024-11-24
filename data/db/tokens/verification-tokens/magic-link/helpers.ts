import { CustomMagicLinkError } from '@/lib/constants/errors/errors';
import { db } from '@/lib/db';

export async function validateMagicLinkRequest(email: string, hashedIp: string) {
  // Check IP limit
  const activeTokensCountSameIp = await db.verificationToken.count({
    where: {
      hashedIp,
      expires: { gt: new Date() },
    },
  });

  if (activeTokensCountSameIp >= 2) {
    throw new CustomMagicLinkError('IpLimit');
  }

  // Check for existing token
  const existingToken = await db.verificationToken.findFirst({
    where: {
      identifier: email,
      expires: { gt: new Date() },
    },
  });

  if (existingToken) {
    throw new CustomMagicLinkError('TokenExists');
  }
}

export async function cleanupExpiredVerificationTokens() {
  await db.verificationToken.deleteMany({
    where: {
      expires: { lt: new Date() },
    },
  });
}
