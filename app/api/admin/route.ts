import { UserRole } from '@prisma/client';
import { NextResponse } from 'next/server';

import { currentSessionRole } from '@/lib/auth-utils';

export async function GET() {
  try {
    const role = await currentSessionRole();

    if (role === UserRole.ADMIN) {
      return NextResponse.json({ message: 'Allowed RH call' }, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Forbidden RH call' }, { status: 403 });
    }
  } catch (error) {
    return NextResponse.json({ message: `Internal Server Error: ${error}` }, { status: 500 });
  }
}
