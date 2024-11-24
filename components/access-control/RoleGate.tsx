import { UserRole } from '@prisma/client';

import { FormError } from '@/components/forms/messages/FormError';
import { currentSessionRole } from '@/lib/auth/auth-utils';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export const RoleGate = async ({ children, allowedRole }: RoleGateProps) => {
  const currentUserRole = await currentSessionRole();
  if (!currentUserRole || currentUserRole !== allowedRole) {
    return <FormError message='You do not have permission to view this content!' />;
  }

  return <>{children}</>;
};
