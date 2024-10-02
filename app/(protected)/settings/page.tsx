import { SessionProvider } from 'next-auth/react';

import { SettingsForm } from '@/app/(protected)/settings/SettingsForm';
import { auth } from '@/auth';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default async function SettingsPage() {
  const session = await auth();
  const user = session?.user;

  return (
    <Card className='w-[600px'>
      <CardHeader>
        <p className='text-center text-2xl font-semibold'>Settings</p>
      </CardHeader>
      <CardContent>
        {user && (
          <SessionProvider>
            <SettingsForm user={user} />
          </SessionProvider>
        )}
      </CardContent>
    </Card>
  );
}
