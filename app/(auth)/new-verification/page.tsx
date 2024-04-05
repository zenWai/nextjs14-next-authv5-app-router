import { Suspense } from 'react';

import { NewVerificationForm } from '@/components/auth/NewVerificationForm';

export default function NewVerificationPage() {
  return (
    <div>
      <Suspense>
        <NewVerificationForm />
      </Suspense>
    </div>
  );
}
