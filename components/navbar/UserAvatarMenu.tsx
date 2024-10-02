import 'server-only';

import { FaUser } from 'react-icons/fa';
import { ExitIcon } from '@radix-ui/react-icons';

import { currentSessionUser } from '@/lib/auth-utils';
import { LogoutButton } from '@/components/LogoutButton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

export async function UserAvatarMenu() {
  const user = await currentSessionUser();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.image || ''} />
          <AvatarFallback className='bg-sky-500'>
            <FaUser className='text-white' />
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className=''>
        <LogoutButton>
          <DropdownMenuItem>
            <ExitIcon className='mr-2 h-4 w-4' />
            Logout
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
