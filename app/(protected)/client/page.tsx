import { SessionProvider } from 'next-auth/react';

import ClientComponent from '@/app/(protected)/client/client-component';

/**
 * Example page demonstrating client-side authentication setup.
 *
 * @notice This setup is specifically for demonstrating client-side session handling.
 * For most applications, it's recommended to:
 * 1. Use server components with auth() to fetch session data
 *
 * @see https://authjs.dev/getting-started/migrating-to-v5
 */
export default function ClientPage() {
  return (
    <SessionProvider>
      <ClientComponent />
    </SessionProvider>
  );
}
