'use server';
import { auth } from '@/auth';

export const currentSessionUser = async () => {
  const session = await auth();

  return session?.user;
};
