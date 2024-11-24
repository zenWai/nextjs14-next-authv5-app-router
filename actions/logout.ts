'use server';

import { signOut } from '@/auth';

export const logoutAction = async () => {
  // some server stuff
  await signOut({ redirectTo: '/' });
};
