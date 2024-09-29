'use client';
import { toast } from 'sonner';

import { admin } from '@/actions/admin';
import { Button } from '@/components/ui/button';

export function AdminOnlyRhAndSa() {
  const onRouteHandlerClick = () => {
    fetch('/api/admin')
      .then(async (response) => {
        const { message } = await response.json();
        if (response.ok) {
          toast.success(message);
        } else {
          toast.error(message);
        }
      })
      .catch(async (error) => {
        const { message } = await error.json();
        toast.error(message);
      });
  };

  const onServerActionClick = () => {
    admin()
      .then((data) => {
        if (data.error) {
          toast.error(data.error);
        }

        if (data.success) {
          toast.success(data.success);
        }
      })
      .catch(() => {
        toast.error('Failed to execute server action');
      });
  };
  return (
    <>
      <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-md'>
        <p className='text-sm font-medium'>Admin-only Route Handler</p>
        <Button onClick={onRouteHandlerClick}>Click to test</Button>
      </div>
      <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-md'>
        <p className='text-sm font-medium'>Admin-only Server Action</p>
        <Button onClick={onServerActionClick}>Click to test</Button>
      </div>
    </>
  );
}
