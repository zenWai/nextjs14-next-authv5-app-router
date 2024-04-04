import { logout } from '@/actions/logout';

export function LogoutButton(props: { children: React.ReactNode }) {
  const onClick = () => {
    logout();
  };

  return (
    <span className='cursor-pointer' onClick={onClick}>
      {props.children}
    </span>
  );
}
