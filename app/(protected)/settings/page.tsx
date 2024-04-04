'use client';

import { logout } from '@/actions/logout';
import { Button } from '@/components/ui/button';

export default function SettingsPage() {
  const onClick = () => {
    logout();
  };

  return (
    <div className=''>
      <Button onClick={onClick} type='submit'>
        Sign out
      </Button>
    </div>
  );
}
