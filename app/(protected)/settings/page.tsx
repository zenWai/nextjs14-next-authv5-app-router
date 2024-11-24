import { SettingsForm } from '@/components/forms/SettingsForm';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { currentSessionUser } from '@/lib/auth/auth-utils';

export default async function SettingsPage() {
  const user = await currentSessionUser();

  return (
    <Card className='w-[600px]'>
      <CardHeader>
        <p className='text-center text-2xl font-semibold'>Settings</p>
      </CardHeader>
      <CardContent>{user && <SettingsForm user={user} />}</CardContent>
    </Card>
  );
}
