import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

import { auth } from '@/auth';

export const GET = auth(function GET(req) {
  if (!req.auth) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const role = req.auth.user.role;
  if (role === UserRole.ADMIN) {
    return NextResponse.json({ message: 'Allowed RH call' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Forbidden RH call' }, { status: 403 });
  }
});
