import { UserRole, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

import { db } from '@/lib/db';

/**
 * Checks if a user exists with the given email and deletes them if found.
 * Ensures clean user test state before registration tests
 */
export async function cleanupTestUserFromDB(email: string): Promise<void> {
  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      await db.user.delete({
        where: { email },
      });
    }
    console.log(`Cleaned up test user: ${email}`);
  } catch (error) {
    console.error(`Error cleaning up test user ${email}:`, error);
    throw error;
  }
}

/**
 * Creates a credentials user.
 * @param name
 * @param email
 * @param password
 * @param options - Optional Configuration options
 * @param options.emailVerified - Defaults to false.
 * @param options.isTwoFactorEnabled - Defaults to false.
 * @param options.role - Defaults to "USER".
 *
 * @returns Promise<void>
 * @throws Error
 */
export async function createCredentialsTestUser(
  name: string,
  email: string,
  password: string,
  options: { emailVerified?: boolean; isTwoFactorEnabled?: boolean; role?: UserRole } = {
    emailVerified: false,
    isTwoFactorEnabled: false,
    role: UserRole.USER,
  }
): Promise<void> {
  try {
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      await cleanupTestUserFromDB(email);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userData: Prisma.UserCreateInput = {
      name,
      email,
      password: hashedPassword,
      emailVerified: options.emailVerified ? new Date() : null,
      isTwoFactorEnabled: options.isTwoFactorEnabled,
      role: options.role,
    };

    await db.user.create({ data: userData });
    console.log(`Created test user: ${email}`);
  } catch (error) {
    console.error('Error creating test user with 2FA:', error);
    throw error;
  }
}
