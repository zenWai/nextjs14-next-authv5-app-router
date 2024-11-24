import 'server-only';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Github from 'next-auth/providers/github';
import Google from 'next-auth/providers/google';
import Resend from 'next-auth/providers/resend';

import { db } from '@/lib/db';
import { getHashedUserIpFromHeaders } from '@/lib/nextjs/headers';
import { VerifiedCredentialsUserSchema } from '@/schemas';

import type { AdapterUser, VerificationToken } from '@auth/core/adapters';

/**
 * Custom Auth.js adapter extending PrismaAdapter
 * 1. CreateVerificationToken with IP tracking, rate limit
 * 2. Custom user creation logic with default name
 */
const adapter = {
  ...PrismaAdapter(db),
  /**
   * Creates a verification token with IP tracking
   * Used when sending magic links
   *
   * @note If it fails, the email will still be sent, a bug, or intended? Did not bother much.
   * @note Remove id from the return object to match PrismaAdapter original patterns, we do not have id tho, currently.
   */
  async createVerificationToken(
    data: VerificationToken
  ): Promise<VerificationToken & { hashedIp: string }> {
    const hashedIp = await getHashedUserIpFromHeaders();

    const token = await db.verificationToken.create({
      data: {
        identifier: data.identifier,
        token: data.token,
        expires: data.expires,
        hashedIp: hashedIp ?? 'nobueno',
      },
    });

    if ('id' in token) {
      delete (token as any).id;
    }

    return token;
  },
  // Follow PrismaAdapter pattern of removing id
  createUser: ({ id, ...data }: AdapterUser) => {
    const userData = {
      ...data,
      name: data.name || 'your pretty fake name',
    };

    return db.user.create({
      data: userData,
    });
  },
};

/**
 * Auth.js (NextAuth.js) Configuration
 *
 * @description Defines authentication providers and their configurations.
 * This setup includes OAuth providers (Google, Github, magic-link with Resend) and credentials-based authentication.
 *
 * Credentials Provider Authorization
 *
 * @description all validation logic is done on login server action.
 */

export default {
  adapter,
  session: {
    strategy: 'jwt',
    maxAge: 2592000,
    updateAge: 86400,
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Github({
      clientId: process.env.AUTH_GITHUB_CLIENT_ID,
      clientSecret: process.env.AUTH_GITHUB_CLIENT_SECRET,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: 'noreply@fpresa.org',
    }),

    Credentials({
      credentials: {
        user: {},
        callbackUrl: {},
      },
      async authorize(credentials) {
        try {
          const userStr = credentials?.user;
          if (typeof userStr !== 'string') return null;

          const user = JSON.parse(userStr);
          const validatedFields = VerifiedCredentialsUserSchema.safeParse(user);
          return validatedFields.success ? validatedFields.data : null;
        } catch (error) {
          console.error('Error parsing credentials:', error);
          return null;
        }
      },
    }),
  ],
  debug: false,
  trustHost: true,
} satisfies NextAuthConfig;
