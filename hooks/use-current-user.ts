'use client';
import { useSession } from 'next-auth/react';

{
  /* To be used on client components */
}
export const useCurrentUser = () => {
  const session = useSession();

  return session.data?.user;
};
