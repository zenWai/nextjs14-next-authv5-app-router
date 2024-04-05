import { Suspense } from 'react';

import { NewPasswordForm } from '@/components/auth/NewPasswordForm';

export default function NewPasswordPage() {
  return (
    <div>
      <Suspense>
        <NewPasswordForm />
      </Suspense>
    </div>
  );
}
