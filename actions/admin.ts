'use server';

import { sessionHasRole } from '@/lib/auth/auth-utils';
import { messages } from '@/lib/constants/messages/actions/messages';

export const adminAction = async () => {
  const isAdmin = await sessionHasRole('ADMIN');
  if (!isAdmin) {
    return { error: messages.admin.errors.FORBIDDEN_SA };
  }

  return { success: messages.admin.success.ALLOWED_SA };
};
