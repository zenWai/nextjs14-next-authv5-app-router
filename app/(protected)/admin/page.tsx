import { UserRole } from '@prisma/client';

import { AdminOnlyRhAndSa } from '@/components/admin-only-rh-and-sa';
import { RoleGate } from '@/components/RoleGate';
import { FormSuccess } from '@/components/form-messages/FormSuccess';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AdminPage() {
  return (
    <Card className='w-[600px]'>
      <CardHeader>
        <p>
          <span aria-label='admin' role='img'>
            🔑
          </span>
          Admin
        </p>
      </CardHeader>
      <CardContent className='space-y-4'>
        <RoleGate allowedRole={UserRole.ADMIN}>
          <FormSuccess message='You are allowed to see this content' />
          <p> This is a example of secret content </p>
        </RoleGate>
        <AdminOnlyRhAndSa />
      </CardContent>
    </Card>
  );
}
