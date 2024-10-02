import { UserRole } from '@prisma/client';

import { currentSessionRole } from '@/lib/auth-utils';
import { FormError } from '@/components/form-messages/FormError';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRole: UserRole;
}

export async function RoleGate({ children, allowedRole }: RoleGateProps) {
  const currentUserRole = await currentSessionRole();
  if (!currentUserRole || currentUserRole !== allowedRole) {
    return <FormError message='You do not have permission to view this content!' />;
  }

  return <>{children}</>;
}
