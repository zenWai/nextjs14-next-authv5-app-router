import { UserRole } from '@prisma/client';
import NextAuth, { type Session } from 'next-auth';

import authConfig from '@/auth.config';
import {
  cleanupExpiredVerificationTokens,
  validateMagicLinkRequest,
} from '@/data/db/tokens/verification-tokens/magic-link/helpers';
import { CustomMagicLinkError } from '@/lib/constants/errors/errors';
import { db } from '@/lib/db';
import { getHashedUserIpFromHeaders } from '@/lib/nextjs/headers';

/**
 * Auth.js (NextAuth.js) Main Configuration
 *
 * @description Primary authentication configuration that extends auth.config.ts.
 *
 * @notice This configuration:
 * Uses JWT strategy for session handling
 * Implements custom types, @/lib/auth/types.d.ts
 * Manages user role and session data through JWT tokens
 *
 */
export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  pages: {
    signIn: '/login',
    error: '/loginerror',
  },
  events: {
    // Runs AFTER an account is linked/OAuth sign in
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
    async signIn({ user, account, profile, isNewUser }) {
      if (isNewUser && account?.provider === 'resend' && !user.name) {
        // do stuff
      }
      if (isNewUser && account?.provider !== 'credentials') {
        // TODO: send welcome email?
      }
    },
  },

  callbacks: {
    async signIn({ user, account, email }) {
      // Magic Link request
      if (email?.verificationRequest === true) {
        /*if(!user) {
        // Block non current users from magic link
          throw new CustomMagicLinkError('NoUserExists')
        }*/
        const hashedIp = await getHashedUserIpFromHeaders();
        if (!hashedIp) {
          throw new CustomMagicLinkError('IpInvalid');
        }
        if (!account?.providerAccountId) {
          throw new CustomMagicLinkError('InvalidEmail');
        }
        // Take this opportunity to clean expired tokens
        await cleanupExpiredVerificationTokens();

        // Check ip limit, check existing token
        await validateMagicLinkRequest(account.providerAccountId, hashedIp);
      }
      // Example: Only allow sign in for users with email addresses ending with "yourdomain.com"
      // return profile?.email?.endsWith("@yourdomain.com")
      return true;
    },
    async session({ token, session }) {
      if (!token.sub) return session;
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub ?? session.user.id,
          role: (token.role as UserRole) ?? UserRole.USER,
          isTwoFactorEnabled: Boolean(token.isTwoFactorEnabled),
          name: token.name ?? session.user.name ?? null,
          email: token.email ?? session.user.email ?? null,
          isOauth: Boolean(token.isOauth),
        },
      } as Session;
    },
    async jwt({ token, trigger, user, account, session }) {
      if ((trigger === 'signIn' || trigger === 'signUp') && user) {
        token.email = user.email;
        token.isOauth = account?.provider !== 'credentials';
        token.name = user.name;
        token.role = user.role;
        token.isTwoFactorEnabled = user.isTwoFactorEnabled;
        return token;
      }

      if (trigger === 'update' && session) {
        token.name = session.user.name;
        token.role = session.user.role;
        token.isTwoFactorEnabled = session.user.isTwoFactorEnabled;
        return token;
      }

      return token;
    },
  },
  ...authConfig,
});
