import { UserRole } from '@prisma/client';

import { AdminActionAndRhTester } from '@/components/access-control/AdminActionAndRhTester';
import { RoleGate } from '@/components/access-control/RoleGate';
import { FormSuccess } from '@/components/forms/messages/FormSuccess';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

/**
 * Admin Page example of role-based access.
 *
 * @description This page showcases how to implement role-based UI components and content visibility
 * using RoleGate component.
 *
 * @notice This page implements multiple levels of protection:
 * 1. Role-based content visibility using RoleGate
 * 2. Server Actions role-based access
 * 3. Route Handler(API) role-based access
 **/
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
        <AdminActionAndRhTester />
      </CardContent>
    </Card>
  );
}
