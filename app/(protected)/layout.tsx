import { NavigationMenu } from '@/components/navbar/NavigationMenu';
import { UserAvatarMenu } from '@/components/navbar/UserAvatarMenu';
import { Navbar } from '@/components/navbar/Navbar';

export default function ProtectedLayout(props: { children: React.ReactNode }) {
  return (
    <div
      className='flex h-full w-full flex-col items-center justify-center gap-y-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))]
        from-sky-400 to-blue-800'
    >
      <Navbar>
        <NavigationMenu />
        <UserAvatarMenu />
      </Navbar>
      {props.children}
    </div>
  );
}
