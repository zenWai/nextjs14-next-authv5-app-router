import { UserRole } from '@prisma/client';
import NextAuth, { type DefaultSession } from 'next-auth';

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `auth`, contains information about the active session.
   */
  interface Session {
    user: {
      id: string;
      role: UserRole;
      isTwoFactorEnabled: boolean;
      isOauth: boolean;
    } & DefaultSession['user']; // This adds name, email, image
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   */
  interface User {
    id: string;
    name: string | null;
    email: string;
    emailVerified: Date | null;
    image: string | null;
    role: UserRole;
    isTwoFactorEnabled: boolean;
    password?: string | null;
    ip?: string | null;
  }

  interface VerificationToken {
    identifier: string;
    expires: Date;
    token: string;
    hashedIp: string;
  }
}

// Custom type for the verified user we pass to signIn Credentials
export interface VerifiedUserForAuth {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  isTwoFactorEnabled: boolean;
  isOauth: boolean;
  emailVerified: Date | null;
  image: string | null;
}

declare module '@auth/core/adapters' {
  interface AdapterUser {
    role: UserRole;
    isTwoFactorEnabled: boolean;
    isOauth: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    // Default
    name?: string | null;
    email?: string | null;
    picture?: string | null;
    sub?: string;
    // standard
    iat?: number;
    exp?: number;
    jti?: string;
    // custom
    id?: string;
    role?: UserRole;
    isTwoFactorEnabled?: boolean;
    isOauth?: boolean;
  }
}
