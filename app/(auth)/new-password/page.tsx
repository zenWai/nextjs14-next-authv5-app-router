import { Suspense } from 'react';

import { NewPasswordForm } from '@/components/auth/forms/NewPasswordForm';

export default function NewPasswordPage() {
  return (
    <div>
      <Suspense>
        <NewPasswordForm />
      </Suspense>
    </div>
  );
}
