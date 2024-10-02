export function Navbar({ children }: { children: React.ReactNode }) {
  return (
    <nav className='flex w-[600px] items-center justify-between rounded-xl bg-secondary p-4 shadow-sm'>{children}</nav>
  );
}
