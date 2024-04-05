import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { type ExtendedUser } from '@/next-auth';

interface UserInfoProps {
  user?: ExtendedUser;
  label: string;
}

export default function UserInfo({ user, label }: UserInfoProps) {
  return (
    <Card className='w-[600px] shadow-md'>
      <CardHeader>
        <p className='text-2x text-center font-semibold'>{label}</p>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* ID */}
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>ID</p>
          <p className='max-w-[180px] truncate rounded-md bg-slate-100 p-1 font-mono text-xs'>{user?.id}</p>
        </div>
        {/* Name */}
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>Name</p>
          <p className='max-w-[180px] truncate rounded-md bg-slate-100 p-1 font-mono text-xs'>{user?.name}</p>
        </div>
        {/* Email */}
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>Email</p>
          <p className='max-w-[180px] truncate rounded-md bg-slate-100 p-1 font-mono text-xs'>{user?.email}</p>
        </div>
        {/* Role */}
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>Role</p>
          <p className='max-w-[180px] truncate rounded-md bg-slate-100 p-1 font-mono text-xs'>{user?.role}</p>
        </div>
        {/* 2FA */}
        <div className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
          <p className='text-sm font-medium'>Two Factor Authentication</p>
          <Badge variant={user?.isTwoFactorEnabled ? 'success' : 'destructive'}>
            {user?.isTwoFactorEnabled ? 'ON' : 'OFF'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
