import 'server-only';
import crypto from 'crypto';

import type { UserRole } from '@prisma/client';

import type { ExtendedUser } from '@/next-auth';
import { auth } from '@/auth';

/** To be used in server components */
export const currentSessionUser = async (): Promise<ExtendedUser | undefined> => {
  const session = await auth();

  return session?.user;
};

/** To be used in server components */
export const currentSessionRole = async (): Promise<UserRole | undefined> => {
  const session = await auth();

  return session?.user?.role;
};

export const hashIp = async (ipAddress: string | null) => {
  if (ipAddress) {
    return crypto.createHash('sha256').update(ipAddress).digest('hex');
  }
  return 'unknown';
};
