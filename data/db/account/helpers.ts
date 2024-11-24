import { unstable_cache } from 'next/cache';

import { db } from '@/lib/db';

export const getAccountByUserId = async (userId: string) => {
  const account = await db.account.findFirst({
    where: { userId },
  });

  return account;
};

// For a possible 'database' session strategy database;
export async function getCachedInfoForJwtByUserId(userId: string) {
  const tags = [`jwt-info-tag-${userId}`];
  const cacheKey = [`jwt-info-key-${userId}`];

  return unstable_cache(
    async () => {
      console.log('🔍 Fetching user and account info from DB...');
      const userWithAccount = await db.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isTwoFactorEnabled: true,
          _count: {
            select: {
              accounts: true,
            },
          },
        },
      });
      console.log('✅ DB fetch completed', userWithAccount ? 'Data found' : 'No data found');

      return {
        user: userWithAccount
          ? {
              id: userWithAccount.id,
              name: userWithAccount.name,
              email: userWithAccount.email,
              role: userWithAccount.role,
              isTwoFactorEnabled: userWithAccount.isTwoFactorEnabled,
            }
          : null,
        hasOAuthAccount: (userWithAccount?._count?.accounts ?? 0) > 0,
      };
    },
    cacheKey,
    {
      tags,
      revalidate: 3600,
    }
  )();
}
