import { SessionProvider } from 'next-auth/react';

import ClientComponent from '@/app/(protected)/client/client-component';

export default function ClientPage() {
  return (
    <SessionProvider>
      <ClientComponent />
    </SessionProvider>
  );
}
