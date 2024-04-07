'use server';
import crypto from 'crypto';

import { auth } from '@/auth';

export const currentSessionUser = async () => {
  const session = await auth();

  return session?.user;
};

export const currentSessionRole = async () => {
  const session = await auth();

  return session?.user?.role;
};

export const hashIp = async (ipAddress: string | null) => {
  if (ipAddress) {
    return crypto.createHash('sha256').update(ipAddress).digest('hex');
  }
  return 'unknown';
};
