'use client';
import { useSession } from 'next-auth/react';

{
  /* To be used on client components */
}
export const useCurrentRole = () => {
  const session = useSession();
  return session?.data?.user?.role;
};
