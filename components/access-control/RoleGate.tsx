import { UserRole } from '@prisma/client';

import { FormError } from '@/components/forms/messages/FormError';
import { currentSessionRole } from '@/lib/auth/auth-utils';

import type { ReactNode } from 'react';

interface RoleGateProps {
  children: ReactNode;
  allowedRole: UserRole;
}

export const RoleGate = async ({ children, allowedRole }: RoleGateProps) => {
  const currentUserRole = await currentSessionRole();
  if (!currentUserRole || currentUserRole !== allowedRole) {
    return <FormError message='You do not have permission to view this content!' />;
  }

  return <>{children}</>;
};
