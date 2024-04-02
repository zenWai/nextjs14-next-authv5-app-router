import { auth, signOut } from '@/auth';
import { Button } from '@/components/ui/button';

export default async function SettingsPage() {
  const session = await auth();
  return (
    <div>
      {JSON.stringify(session)}
      <form
        action={async () => {
          'use server';

          await signOut();
        }}
      >
        <Button type='submit'>Sign out</Button>
      </form>
    </div>
  );
}
