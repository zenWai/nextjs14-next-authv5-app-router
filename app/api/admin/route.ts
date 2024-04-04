import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

import { currentSessionRole } from '@/lib/auth-utils';

export async function GET() {
  const role = await currentSessionRole();

  if (role === UserRole.ADMIN) {
    return new NextResponse(null, {
      status: 200,
    });
  }
  return new NextResponse(null, { status: 403 });
}
