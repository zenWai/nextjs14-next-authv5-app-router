import authConfig from "@/auth.config";
import {UserRole} from "@prisma/client";
import NextAuth, {type DefaultSession} from "next-auth"
import {PrismaAdapter} from "@auth/prisma-adapter"
import {db} from '@/lib/db'
import {getUserById} from "@/data/user";

type ExtendedUser = DefaultSession["user"] & {
  role: "ADMIN" | "USER"
}

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
}

export const {
  handlers: {GET, POST},
  auth,
  signIn,
  signOut
} = NextAuth({
  callbacks: {
    async session({token, session}) {
      console.log({SessionToken: token})
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if(token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
      console.log({Session: session})

      return session;
    },
    async jwt({token}) {
      if(!token.sub) return token;
      const existingUser = await getUserById(token.sub);

      if(!existingUser) return token;

      token.role = existingUser.role;

      return token;
    }
  },
  adapter: PrismaAdapter(db),
  session: {strategy: "jwt"},
  ...authConfig,
})