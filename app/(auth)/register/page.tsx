import { Suspense } from 'react';

import { RegisterForm } from '@/components/auth/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
